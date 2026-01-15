import ldap, { Client, SearchOptions, SearchEntry } from 'ldapjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const LDAP_HOST = process.env.LDAP_HOST || '161.246.14.24';
const LDAP_PORT = parseInt(process.env.LDAP_PORT || '389');
const BASE_DN = process.env.LDAP_BASE_DN || 'dc=kmitl,dc=ac,dc=th';

export const authenticateWithLdap = async (email: string, password: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        // 1. Create initial client for anonymous search
        const client = ldap.createClient({
            url: `ldap://${LDAP_HOST}:${LDAP_PORT}`,
            timeout: 10000,
            connectTimeout: 10000
        });

        client.on('error', (err) => {
            console.error('LDAP Client Error:', err);
            // Don't reject directly here as it might be a connectivity jitter, 
            // but for auth purposes if we can't connect initialy it's a fail.
        });

        // 2. Bind Anonymously
        client.bind('', '', (err) => {
            if (err) {
                client.unbind();
                return reject(new Error('Cannot bind to LDAP server anonymously: ' + err.message));
            }

            // 3. Search for the user
            const username = email.split('@')[0]; // Assuming KMITL LDAP searches by UID or CN which equals username part
            const searchOptions: SearchOptions = {
                scope: 'sub',
                filter: `(mail=${username}@kmitl.ac.th)` // Try matching full email if possible, or adjust based on LdapAuth.js which used (mail=${username})
                // LdapAuth.js used: filter: \`(mail=\${username})\`
                // If the user passes "username" to LdapAuth.authenticate, it works.
                // In our controller we have "email" (e.g. somchai@kmitl.ac.th).
                // So let's search by (mail=${email}).
            };
            
            // NOTE: The example code used `username` in (mail=${username}).
            // If the input was just "somchai", then it expects mail=somchai.
            // But mail usually has domain.
            // Let's assume (mail=${email}) is correct if we pass the full email.
            
            client.search(BASE_DN, {
                scope: 'sub', 
                filter: `(mail=${email})`
            }, (err, res) => {
                if (err) {
                    client.unbind();
                    return reject(new Error('LDAP search failed: ' + err.message));
                }

                let userDn: string | null = null;
                let userObject: any = null;

                res.on('searchEntry', (entry: SearchEntry) => {
                    userDn = entry.objectName || entry.dn.toString();
                    userObject = entry.pojo;
                    console.log("=== LDAP DEBUG ===");
                    console.log("Found DN:", userDn);
                    console.log("User Object:", JSON.stringify(userObject, null, 2));
                });

                res.on('error', (err) => {
                    console.error('LDAP Search Res Error:', err);
                    // reject(err); // Wait for 'end'
                });

                res.on('end', (result) => {
                    // Unbind the anonymous client
                    client.unbind();

                    if (!userDn) {
                        return reject(new Error('User not found in LDAP'));
                    }

                    // 4. Authenticate with Found DN
                    const authClient = ldap.createClient({
                        url: `ldap://${LDAP_HOST}:${LDAP_PORT}`,
                         timeout: 10000,
                        connectTimeout: 10000
                    });

                    authClient.on('error', (err) => console.error('Auth Client Error', err));

                    authClient.bind(userDn, password, (err) => {
                        authClient.unbind();
                        if (err) {
                            console.log("=== LDAP BIND ERROR ===");
                            console.log("DN used:", userDn);
                            console.log("Error code:", (err as any).code);
                            console.log("Error message:", err.message);
                            return reject(new Error('Authentication failed (Bind Error)'));
                        }
                        
                        // Success!
                        // Map LDAP user attributes to our User structure if needed
                        // userObject.attributes contains the data
                        
                        const attributes: any = {};
                        if (userObject && userObject.attributes) {
                             userObject.attributes.forEach((attr: any) => {
                                 attributes[attr.type] = attr.values[0];
                             });
                        }

                        resolve({
                            dn: userDn,
                            cn: attributes.cn || '',
                            mail: attributes.mail || email,
                            ...attributes
                        });
                    });
                });
            });
        });
    });
};

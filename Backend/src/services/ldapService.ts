import { authenticate } from 'ldap-authentication';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const LDAP_HOST = process.env.LDAP_HOST || '161.254.14.24';
const LDAP_PORT = parseInt(process.env.LDAP_PORT || '389');
const BASE_DN = process.env.LDAP_BASE_DN || 'dc=kmitl,dc=ac,dc=th';

export const authenticateWithLdap = async (email: string, password: string): Promise<any> => {
  // Extract username from email (e.g., 'xxxx@kmitl.ac.th' -> 'xxxx')
  // Depending on KMITL LDAP, they might authenticat with full email or just uid.
  // We will try with the part before @ first.
  const username = email.split('@')[0];

  const options = {
    ldapOpts: {
      url: `ldap://${LDAP_HOST}:${LDAP_PORT}`,
      connectTimeout: 10000,
      timeout: 10000,
    },
    // We assume direct bind is possible or we construct the DN.
    // If we don't know the userDn structure, we might need a service account to search.
    // BUT without a service account provided in ENV, we must guess the DN pattern or hope for anonymous search + bind.
    
    // Pattern 1: Try binding directly if the server supports email as DN (unlikely for pure LDAP, possible for AD)
    // Pattern 2: Typical Unix LDAP: uid=<username>,ou=people,dc=kmitl,dc=ac,dc=th
    // We will start with a configurable approach or a common guess.
    
    // Attempting to search first (verify via anonymous bind if allowed) or direct bind
    // using ldap-authentication's 'userSearchBase' mode if we just want to find user.
    // But 'authenticate' needs to Bind.
    
    userDn: `uid=${username},ou=people,${BASE_DN}`, // Common structure guess
    
    // Ideally we would search, but we have no admin creds.
    // Let's try to pass the username and see.
    userPassword: password,
    usernameAttribute: 'uid',
    username: username,
    userSearchBase: BASE_DN,
  };

  try {
    // Note: If KMITL allows anonymous search, we can use adminDn=null/undefined.
    // If we need to Bind as the user directly (no search), we rely on userDn being correct.
    const user = await authenticate(options);
    return user;
  } catch (error) {
    throw error;
  }
};

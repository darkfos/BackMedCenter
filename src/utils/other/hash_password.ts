import bcrypt from 'bcrypt';

export function hashPassword(password: string) {
    return await bcrypt.hash(password, 14);
}

export function verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
}
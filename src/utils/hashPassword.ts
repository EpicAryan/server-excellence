import bcrypt from "bcrypt";



// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  if (!password) {
    throw new Error("Password is required");
  }
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare passwords
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

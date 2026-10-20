export async function login(email, password) {
  await new Promise((r) => setTimeout(r, 400));
  if (email === "demo@gymflow.com" && password === "demo1234") {
    return { name: "Demo Owner", role: "admin" };
  }
  throw new Error("Wrong email or password");
}

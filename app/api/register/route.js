export const POST = async (req) => {
    const { name, email, password } = await req.json();
    console.log(`email: ${email}, password: ${password}`);
    return NextResponse.json({ message: "User registered successfully" });
}
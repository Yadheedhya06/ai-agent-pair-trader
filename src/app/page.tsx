export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-[#FFE5B4] text-6xl font-bold mb-16" style={{ fontFamily: 'Impact, sans-serif' }}>
                    WELCOME TO THE AI TRADING AGENT
                </h1>

                <p className="text-white text-3xl mb-20 leading-relaxed">
                    To use this bot, please add it to your Discord server using the link below and contact the Dev to get agent permission for pair trades in your channel.
                </p>

                <a
                    href="https://discord.com/oauth2/authorize?client_id=1328252796931149857&permissions=137439284224&integration_type=0&scope=bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-[#2B4EFF] text-white text-2xl font-bold px-12 py-6 rounded-full hover:bg-blue-700 transition-all"
                    style={{ fontFamily: 'Impact, sans-serif' }}
                >
                    ADD BOT TO DISCORD
                    <span className="ml-4">→</span>
                </a>
            </div>
        </main>
    );
}
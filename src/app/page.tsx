'use client';
import { useState } from 'react';

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleTrigger = async () => {
        setIsLoading(true);
        setIsSuccess(false);
        try {
            const response = await fetch('/api/cron/discord');
            if (!response.ok) {
                throw new Error('Failed to trigger');
            }
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
            }, 2300);
            console.log('Trigger successful');
        } catch (error) {
            console.error('Trigger failed:', error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black">
            <div className="trigger-button-container">
                <button
                    onClick={handleTrigger}
                    className="trigger-button bg-gray-700 text-white px-8 py-3 rounded-full hover:bg-gray-600 transition-all"
                    style={{
                        fontFamily: '"Comic Sans MS", cursive',
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                        letterSpacing: '0.05em'
                    }}
                >
                    Trigger
                </button>
                {isLoading && (
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
                {isSuccess && !isLoading && (
                    <div className="success-checkmark">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-500">
                            <path
                                fill="currentColor"
                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                            />
                        </svg>
                    </div>
                )}
            </div>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-[#FFE5B4] text-6xl font-bold mb-16" style={{ fontFamily: 'Impact, sans-serif' }}>
                    WELCOME TO THE AI TRADING AGENT
                </h1>

                <p className="text-white text-3xl mb-20 leading-relaxed">
                    To use this agent, please add it to your Discord server clicking button below and contact Dev to get agent permission for pair trades in your channel.
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
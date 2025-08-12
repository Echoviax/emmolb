import { useState } from 'react';
import Picker, { EmojiClickData } from 'emoji-picker-react';
import { getContrastTextColor } from '@/helpers/ColorHelper';
import { useRouter } from 'next/navigation';

export function EditLeague({league, status, setStatus,}: {league?: any, status: 'idle' | 'submitting' | 'success' | 'error'; setStatus: (status: 'idle' | 'submitting' | 'success' | 'error') => void;}) {
    const [leagueName, setLeagueName] = useState(league?.league_name || '');
    const [leagueEmoji, setLeagueEmoji] = useState(league?.league_emoji || '⚾');
    const [leagueColor, setLeagueColor] = useState(league?.league_color || '#FFFFFF');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [privateLeague, setPrivateLeague] = useState(false);
    const [error, setError] = useState<string>('');

    const router = useRouter();

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setLeagueEmoji(emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        let res: Response;
        if (league){
            res = await fetch('/nextapi/db/leagues/edit-league', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    league_name: leagueName,
                    league_emoji: leagueEmoji,
                    league_color: leagueColor,
                    league_id: league.league_id,
                }),
            });
        } else {
            if (privateLeague) {
                res = await fetch('/nextapi/db/leagues/create-private-league', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        league_name: leagueName,
                        league_emoji: leagueEmoji,
                        league_color: leagueColor,
                    }),
                });
            } else { 
                res = await fetch('/nextapi/db/leagues/create-league', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        league_name: leagueName,
                        league_emoji: leagueEmoji,
                        league_color: leagueColor,
                    }),
                });
            }
        }

        if (res.ok) {
            router.push(`/custom-league/${league ? league.league_id : ''}`);
            window.location.reload();
        } else {
            setStatus('error');
            const errorData = await res.json().catch(() => ({}));
            setError(errorData.error || 'Unknown error');
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center text-center space-y-10 mx-auto">
            <div className='relative w-full h-20 px-6 py-4 rounded-2xl shadow-xl overflow-hidden flex items-center transition' style={{background: leagueColor, color: getContrastTextColor(leagueColor)}}>
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-5xl flex-shrink-0 cursor-pointer">
                    {leagueEmoji}
                </button>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
                        <input type="text" value={leagueName} onChange={(e) => setLeagueName(e.target.value)} className="text-xl font-bold tracking-wide leading-tight text-center border-b-2 border-theme-accent py-1 focus:outline-none pointer-events-auto" maxLength={24} required/>
                </div>
            </div>
            {showEmojiPicker && (
                <div className="absolute z-10 -translate-x-1/2 left-1/2 mt-2">
                    <Picker onEmojiClick={handleEmojiClick} />
                </div>
            )}

            <div>
                <label className="block mb-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide opacity-70 leading-tight">League Color</label>
                <input type="color" value={leagueColor} onChange={(e) => setLeagueColor(e.target.value)} className="w-24 h-12 rounded-md cursor-pointer" required/>
            </div>
            {!league && (<div>
                <label className="block mb-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide opacity-70 leading-tight">Protected League?</label>
                <input type="checkbox" checked={privateLeague} onChange={(e) => setPrivateLeague(e.target.checked)} className="w-24 h-12 rounded-md cursor-pointer bg-theme-primary border-2 border-theme-accent" />
            </div>)}
            
            <div>
                <button type='submit' disabled={status === 'submitting'} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                    {status === 'submitting' ? 'Please wait...' : 'Save League'}
                </button>
            </div>
            {status === 'error' && <div className="text-theme-secondary text-sm">Error creating/editing league. Please try again.<br></br>{error}</div>} 
        </form>
    )
}
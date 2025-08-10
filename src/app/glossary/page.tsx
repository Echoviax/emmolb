'use client';

import { useState } from "react";

type Categories = 'Stats' | 'Attributes' | 'Terms' | 'Weather' | 'Lesser Boons' | 'Modifications' | 'Proclamations';

export default function GlossaryPage() {
    const [category, setCategory] = useState<Categories>('Stats');

    return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto">
                <div className="bg-theme-primary rounded-xl shadow-lg p-6 text-center text-2xl font-semibold mb-6">Glossary</div>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {['Stats', 'Attributes', 'Terms', 'Weather', 'Lesser Boons', 'Modifications', 'Proclamations'].map((title) => (
                        <button key={title} className={`px-3 py-1 rounded-md text-sm ${category === title ? 'bg-theme-weather' : 'bg-theme-primary'}`} onClick={() => setCategory(title as Categories)}>
                            {title}
                        </button>
                    ))}
                </div>
                <div className={`bg-theme-primary rounded-xl shadow-lg p-6 space-y-2 text-theme-text/70 text-sm ${category === 'Proclamations' ? 'visible' : 'hidden'}`}>
                    <h2 className="text-xl font-bold mb-4 text-theme-text">Proclamations</h2>
                    <ul className="list-disc ml-5 space-y-1">
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 0: Lesser Reseeding</span> – Reseed the Players.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 0: Lesser Relegation</span> – Relegate the Players.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 0: Lesser Replacement</span> – Replace the Players.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 1: Overstocked</span> – In Delivery Weather, after receiving their Delivery, the winning Team will donate one of their pieces of Equipment to the losing Team.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 1: Package Thief</span> – In Delivery Weather, the losing Team receives the Delivery instead of the winning Team.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 1: Large Shipments</span> – In Delivery Weather, three Deliveries with Lesser Enchantments are Delivered. The losing Team receives two, and the winning Team receives one.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 2: Weather Prognostication</span> – A new device will be Delivered to each Team's Ballpark, granting some control over the Weather.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 2: Dimensional Boundary Survey</span> – A survey crew will measure each Ballpark, allowing you to make adjustments to your park's Dimensions.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 2: Legally Loud</span> – Repeal local noise ordinances at all Ballparks, allowing Crowds to cheer for their favorite Teams.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 3: Absorb</span> – An extremely large coronal mass ejection approaches Earth which threatens all ROBO-UMPs. Upgrade the machines to attempt to absorb the energy from Geomagnetic Storms. In Geomagnetic Storms Weather, ROBO-UMP will occasionally Eject players from the game.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 3: Shelter</span> – An extremely large coronal mass ejection approaches Earth which threatens all ROBO-UMPs. Attempt to Shelter the machines to prevent their destruction, using backup Umpires temporarily during the Geomagnetic Storms. Backed by the ROBO-UMP Association and the Commissioner of MMOLB. In Geomagnetic Storms Weather, they are replaced by fallible Human Umpires, who can occasionally mistake Balls and Strikes or blow calls.</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Season 3: Forsake</span> – An extremely large coronal mass ejection approaches Earth which threatens all ROBO-UMPs. Forsake the machines, inevitably leading to their complete destruction during the ensuing Geomagnetic Storms. In Geomagnetic Storms Weather, the home team's ROBO-UMP may take damage and be destroyed. Teams may obtain a free replacement ROBO-UMP or opt to keep using Human Umpires.</li>
                    </ul>
                </div>
                <div className={`bg-theme-primary rounded-xl shadow-lg p-6 space-y-2 text-theme-text/70 text-sm ${category === 'Modifications' ? 'visible' : 'hidden'}`}>
                    <h2 className="text-xl font-bold mb-4 text-theme-text">Modifications</h2>
                    <ul className="list-disc ml-5 space-y-1">
                    <li>
                        <span className="text-theme-text font-semibold">🌱 Rookie</span> – Still learning the game. -20% to All Attributes</li>
                        <li>
                        <span className="text-theme-text font-semibold">🌌 Celestial Infusion</span> – Infused with Celestial Energy. +25 to Muscle and Presence</li>
                        <li>
                        <span className="text-theme-text font-semibold">🌌 Celestial Infusion II</span> – Infused with Celestial Energy. +50 to Muscle and Presence</li>
                        <li>
                        <span className="text-theme-text font-semibold">🌌 Celestial Infusion III</span> – Infused with Celestial Energy. +100 to Muscle and Presence</li>
                        <li>
                        <span className="text-theme-text font-semibold">😇 Retired</span> – This player no longer plays in the MMOLB.</li>
                        <li>
                        <span className="text-theme-text font-semibold">📦 Replacement</span> – This player is a Replacement.</li>
                        <li>
                        <span className="text-theme-text font-semibold">🧳 Relegated</span> – This Player now plays in the Even Lesser League.</li>
                        <li>
                        <span className="text-theme-text font-semibold">📣 Hype</span> – Fired up by the crowd!</li>
                    </ul>
                </div>
                <div className={`bg-theme-primary rounded-xl shadow-lg p-6 space-y-2 text-theme-text/70 text-sm ${category === 'Lesser Boons' ? 'visible' : 'hidden'}`}>
                    <h2 className="text-xl font-bold mb-4 text-theme-text">Lesser Boons</h2>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>
                        <span className="text-theme-text font-semibold">🤖 Soul in the Machine</span> – This Player has assumed a ROBO-form. +50% Accuracy, Discipline, and Arm, -50% Cunning, Presence, and Speed</li>
                        <li>
                        <span className="text-theme-text font-semibold">😈 Demonic</span> – Possessed by infernal power. +50% Muscle, Velocity, and Reaction, -50% Discipline, Control, and Composure</li>
                        <li>
                        <span className="text-theme-text font-semibold">👼 Angelic</span> – Blessed by the heavens. +50% Discipline, Control, and Awareness, -50% Muscle, Velocity, and Reaction</li>
                        <li>
                        <span className="text-theme-text font-semibold">🧟 Undead</span> – Neither living nor dead. +50% Determination, Stamina, and Composure, -50% Contact, Presence, and Speed</li>
                        <li>
                        <span className="text-theme-text font-semibold">🗿 Giant</span> – Colossal stature. +50% Muscle, Stamina, and Arm, -50% Contact, Control, and Agility</li>
                        <li>
                        <span className="text-theme-text font-semibold">🔥 Fire Elemental</span> – Wreathed in flame. +50% Lift, Velocity, and Speed, -50% Vision, Control, and Composure</li>
                        <li>
                        <span className="text-theme-text font-semibold">💧 Water Elemental</span> – Flowing like water. +50% Contact, Control, and Dexterity, -50% Muscle, Velocity, and Reaction</li>
                        <li>
                        <span className="text-theme-text font-semibold">💨 Air Elemental</span> – Light as air. +50% Aiming, Accuracy, and Agility, -50% Muscle, Velocity, and Arm</li>
                        <li>
                        <span className="text-theme-text font-semibold">⛰️ Earth Elemental</span> – Made of stone. +50% Contact, Stamina, and Patience, -50% Vision, Control, and Speed</li>
                        <li>
                        <span className="text-theme-text font-semibold">🐲 Draconic</span> – Draconic might. +50% Lift, Presence, and Arm, -50% Discipline, Control, and Agility</li>
                        <li>
                        <span className="text-theme-text font-semibold">🧚 Fae</span> – Trickster spirit. +50% Cunning, Persuasion, and Dexterity, -50% Muscle, Velocity, and Arm</li>
                        <li>
                        <span className="text-theme-text font-semibold">⚾ One With All</span> – Trained in the basics. +30% Selflessness, Contact, Control, and Velocity, -30% Determination, Greed, Persuasion, and Presence</li>
                        <li>
                        <span className="text-theme-text font-semibold">🏹 Archer's Mark</span> – Sharpshooter. +30% Aiming, Vision, Velocity, and Accuracy, -30% Intimidation, Greed, Stuff, and Presence</li>
                        <li>
                        <span className="text-theme-text font-semibold">📐 Geometry Expert</span> – Master of angles. +30% Insight, Contact, Control, and Rotation, -30% Muscle, Vision, Velocity, and Defiance</li>
                        <li>
                        <span className="text-theme-text font-semibold">🛴 Scooter</span> – Scooting around. +30% Speed, Intimidation, Velocity, and Defiance, -30% Muscle, Discipline, Control, and Stamina</li>
                        <li>
                        <span className="text-theme-text font-semibold">🚦 The Light</span> – Saw the light. +30% Vision, Discipline, Control, and Presence, -30% Contact, Performance, Velocity, and Stuff</li>
                        <li>
                        <span className="text-theme-text font-semibold">🦡 Tenacious Badger</span> – Digging in. +30% Determination, Muscle, Stamina, and Guts, -30% Vision, Speed, Persuasion, and Defiance</li>
                        <li>
                        <span className="text-theme-text font-semibold">⛈️ Stormrider</span> – Rides the storm. +30% Lift, Speed, Velocity, and Stuff, -30% Wisdom, Stealth, Control, and Rotation</li>
                        <li>
                        <span className="text-theme-text font-semibold">🐞 Insectoid</span> – Insect form. +30% Intimidation, Muscle, Accuracy, and Persuasion, -30% Discipline, Insight, Defiance, and Presence</li>
                        <li>
                        <span className="text-theme-text font-semibold">🧹 Clean</span> – Spotless. +30% Determination, Discipline, Persuasion, and Presence, -30% Wisdom, Insight, Velocity, and Defiance</li>
                        <li>
                        <span className="text-theme-text font-semibold">🌟 Shiny</span> – Shining brightly. +30% Insight, Vision, Presence, and Accuracy, -30% Cunning, Stealth, Stuff, and Guts</li>
                        <li>
                        <span className="text-theme-text font-semibold">👁️ Psychic</span> – Glimpses the future. +30% Vision, Wisdom, Accuracy, and Persuasion, -30% Intimidation, Muscle, Velocity, and Stuff</li>
                        <li>
                        <span className="text-theme-text font-semibold">🛸 UFO</span> – Taken flight. +30% Contact, Lift, Rotation, and Stuff, -30% Discipline, Wisdom, Control, and Stamina</li>
                        <li>
                        <span className="text-theme-text font-semibold">👻 Spectral</span> – Ghostly. +30% Stealth, Intimidation, Presence, and Rotation, -30% Muscle, Contact, Stuff, and Guts</li>
                        <li>
                        <span className="text-theme-text font-semibold">🐸 Amphibian</span> – Amphibious form. +30% Speed, Performance, Velocity, and Persuasion, -30% Insight, Muscle, Presence, and Defiance</li>
                        <li>
                        <span className="text-theme-text font-semibold">🧜 Mer</span> – Aquatic form. +30% Determination, Wisdom, Control, and Stuff, -30% Lift, Aiming, Rotation, and Guts</li>
                        <li>
                        <span className="text-theme-text font-semibold">🧮 Calculated</span> – Counts everything. +30% Discipline, Insight, Control, and Accuracy, -30% Muscle, Greed, Guts, and Stamina</li>
                    </ul>
                </div>
                <div className={`bg-theme-primary rounded-xl shadow-lg p-6 space-y-2 text-theme-text/70 text-sm ${category === 'Weather' ? 'visible' : 'hidden'}`}>
                    <h2 className="text-xl font-bold mb-4 text-theme-text">Weather</h2>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>
                        <span className="text-theme-text font-semibold">☀️ Sunny</span> – It is Very Sunny.</li>
                        <li>
                        <span className="text-theme-text font-semibold">🌤️ Mostly Sunny</span> – It is Mostly Sunny.</li>
                        <li>
                        <span className="text-theme-text font-semibold">⛅ Partly Cloudy</span> – It is Partly Cloudy.</li>
                        <li>
                        <span className="text-theme-text font-semibold">☁️ Cloudy</span> – It is Cloudy.</li>
                        <li>
                        <span className="text-theme-text font-semibold">🌧️ Rain Showers</span> – It is Raining.</li>
                        <li>
                        <span className="text-theme-text font-semibold">⛈️ Thunderstorms</span> – It is Storming.</li>
                        <li>
                        <span className="text-theme-text font-semibold">🌫️ Fog</span> – It is Foggy.</li>
                        <li>
                        <span className="text-theme-text font-semibold">🌨️ Snow</span> – It is Snowing.</li>
                        <li>
                        <span className="text-theme-text font-semibold">🌠 Starfall</span> – A chance of Falling Stars.</li>
                        <li>
                        <span className="text-theme-text font-semibold">🎆 Fireworks</span> – Beautiful Fireworks light up the field.</li>
                        <li>
                        <span className="text-theme-text font-semibold">📦 Delivery</span> – Equipment is delivered to the winning team.</li>
                        <li>
                        <span className="text-theme-text font-semibold">🚚 Shipment</span> – Three magic items are delivered. The winning team receives one, while the losing team receives two.</li>
                        <li>
                        <span className="text-theme-text font-semibold">📦 Special Delivery</span> – The winning team receives a Rare item.</li>
                        <li>
                        <span className="text-theme-text font-semibold">💰 Prosperity</span> – Runs reward tokens to team owners.</li>
                        <li>
                        <span className="text-theme-text font-semibold">🧲 Geomagnetic Storms</span> – ROBO-UMP may absorb energy from the storms, causing Ejections. A Photo Contest is held at the end of each game.</li>
                    </ul>
                </div>
                <div className={`bg-theme-primary rounded-xl shadow-lg p-6 space-y-2 text-theme-text/70 text-sm ${category === 'Terms' ? 'visible' : 'hidden'}`}>
                    <h2 className="text-xl font-bold mb-4 text-theme-text">Terms</h2>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>
                        <span className="text-theme-text font-semibold">Augments</span> – Augments are a way to alter players or a team's roster. Each Lesser League Team Owner is given one Augment per day, which applies at Midnight, Central US time.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Tokens</span> – Tokens are a currency that can be spent at Quaelyth's Curios to purchase new Equipment Items and Crafting Materials. They are earned by Teams playing in specific Weather types.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Motes</span> – Motes are a currency that can be spent to reroll your selection of Augments or the available wares at Quaelyth's Curios. Each Lesser League Team earns 5 Motes per day.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Greater League</span> – The Greater League consists of Teams managed collectively by the community. Each Greater League has an associated Lesser League where fan-managed teams compete.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Lesser League</span> – The Lesser League consists of Teams managed by you, the fans. At the end of each Season, the top Team from each Lesser League gets one of their players called up to the Greater League, selected by community vote.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Election</span> – The Election is a community vote that happens at the end of each Season, after the Postseason. Fans vote on a Proclamation and which player to call up from their top Lesser League team.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Postseason</span> – The Postseason is a contest to determine the Champion of the Season. In the Greater League, this consists of a 6-team Postseason with a Wildcard Round, Semi-Final Round, and the Greatest Series. In the Lesser League, all Teams play in the Kumite.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Superstar Game</span> – A legally distinct exhibition game with All of the Star players, held once per Season during the Superstar Break.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Home Run Challenge</span> – A contest to see who can hit the most Home Runs, held once per Season during the Superstar Break.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Quaelyth's Curios</span> – A mystical shop in Ballpark Village that trades rare wares for Tokens.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Hall of Unmaking</span> – A dark hall where players can be offered up for Recomposition.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Recomposition</span> – The ritual of transforming one Player into another, which rerolls their Name, Likes, Dislikes, and Attributes once per day.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Clubhouse</span> – A quiet spot to chat with your players and learn their secrets, allowing you to choose one of their Attribute categories to view once per day.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Ballpark Village</span> – The district surrounding your Ballpark, home to several attractions which can be used by fans to interact with their Lesser League Team.</li>
                        <li>
                        <span className="text-theme-text font-semibold">Inventory</span> – A personal space for storing and crafting Equipment Items.</li>
                    </ul>
                </div>
                <div className={`bg-theme-primary rounded-xl shadow-lg p-6 space-y-2 text-theme-text/70 text-sm ${category === 'Attributes' ? 'visible' : 'hidden'}`}>
                    <h2 className="text-xl font-bold mb-4 text-theme-text">Attributes</h2>
                    <ul className="list-disc ml-5 space-y-1">
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Accuracy</span> – Pitcher's ability is to pitch to their intended zone</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Acrobatics</span> – Fielder's ability to field Line Drives</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Agility</span> – Fielder's ability to field Fly Balls</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Aiming</span> – Batter's ability to hit Line Drives</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Arm</span> – Fielder's ability to throw the ball</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Awareness</span> – Fielder's ability to make tough plays</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Composure</span> – Fielder's ability to play without making Errors</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Contact</span> – Batter's ability to make contact, putting the ball in play</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Control</span> – Pitcher's ability to have control of their pitch, remaining inside the strike zone</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Cunning</span> – Batter's ability to draw a Hit By Pitch</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Defiance</span> – Pitcher's ability to defy the Manager and remain in the game for longer</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Determination</span> – Batter's ability to remain determined by fouling the ball</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Dexterity</span> – Fielder's ability to make quick dextrous moves, preventing runners from getting extra bases</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Discipline</span> – Batter's ability to remain disciplined at the plate, laying off of pitches outside the strike zone</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Greed</span> – Baserunner's willingness to attempt to steal a base</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Guts</span> – Pitcher's ability to play better when their Energy is low</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Insight</span> – Batter's ability to choose an optimal location to hit a ball in play</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Intimidation</span> – Batter's ability to scare a pitcher away from throwing in the strike zone</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Lift</span> – Batter's ability to hit Fly Balls</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Luck</span> – A player's ability to defy the odds</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Muscle</span> – Batter's ability to make powerful hits</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Patience</span> – Fielder's ability to field Popups</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Performance</span> – Baserunner's ability to distract fielders</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Persuasion</span> – Pitcher's ability to draw foul balls</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Presence</span> – Pitcher's ability to scare the batter, reduce powerful hits</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Priority</span> – Determines a batter's position in the Lineup</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Reaction</span> – Fielder's ability to field Ground Balls</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Rotation</span> – Pitcher's ability to throw pitches with a high spin rate which are hard to hit</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Selflessness</span> – Batter's willingness to hit into a sacrifice play</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Speed</span> – Baserunner's raw speed on the basepaths</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Stamina</span> – Pitcher's ability to remain in top form even as they lose Energy</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Stealth</span> – Baserunner's ability to remain undetected when attempting to steal a base</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Stuff</span> – Pitcher's ability to throw dirty pitches that result in more Ground Balls or Popups</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Velocity</span> – Pitcher's ability to throw hard and fast, making their pitches in the strike zone more effective</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Vision</span> – Batter's ability to track the pitch as it's coming at them</li>
                        <li className="mb-1">
                        <span className="text-theme-text font-semibold">Wisdom</span> – Batter's ability to learn from each pitch</li>
                    </ul>
                </div>
                <div className={`bg-theme-primary rounded-xl shadow-lg p-6 space-y-2 text-theme-text/70 text-sm ${category === 'Stats' ? 'visible' : 'hidden'}`}>
                    <h2 className="text-xl font-bold mb-4 text-theme-text">Stats</h2>
                    <ul className="list-disc ml-5 space-y-1">
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">AVG</span> – Hits divided by at bats – the most basic measure of batting success</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">OBP</span> – How often a player reaches base per plate appearance</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">SLG</span> – Total bases per at bat, reflecting power</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">OPS</span> – On-base percentage plus slugging</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">PA</span> – Plate appearances – every completed trip to the plate</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">AB</span> – Official at bats (does not include walks or sacrifices)</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">H</span> – Total hits recorded</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">1B</span> – Singles</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">2B</span> – Doubles</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">3B</span> – Triples</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">HR</span> – Home runs</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">BB</span> – Walks</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">K</span> – Strikeouts</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">SB</span> – Stolen bases</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">CS</span> – Times caught stealing</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">GIDP</span> – Grounded into double plays</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">ERA</span> – Earned runs allowed per nine innings</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">IP</span> – Innings pitched</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">WHIP</span> – Walks and hits allowed per inning pitched</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">K/BB</span> – Strikeouts divided by walks</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">K/9</span> – Strikeouts per nine innings</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">H/9</span> – Hits allowed per nine innings</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">HR/9</span> – Home runs allowed per nine innings</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">BB/9</span> – Walks allowed per nine innings</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">W</span> – Pitching wins</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">L</span> – Pitching losses</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">QS</span> – Quality starts</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">SV</span> – Saves</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">BS</span> – Blown saves</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">G</span> – Appearances</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">CG</span> – Complete games</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">SHO</span> – Shutouts</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">NH</span> – No hitters</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">ER</span> – Earned runs</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">HB</span> – Hit batters</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">PO</span> – Putouts</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">A</span> – Assists</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">DP</span> – Double plays</li>
                        <li className="mb-1">
                            <span className="text-theme-text font-semibold">E</span> – Errors</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
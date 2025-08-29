import MiniTeamHeader from "./MiniTeamHeader";
import { MapAPITeamResponse } from "@/types/Team";
import { Bases } from "@/types/Bases";
import { Baserunner, ProcessMessage } from "./BaseParser";
import { useGameLiveEvents } from "@/hooks/api/LiveEvents";

function getTeamInitials(team: any) {
  if (!team) return "";

  const locationInitial = team.Location ? team.Location.charAt(0) : "";

  // Split Name by spaces, filter out empty strings, take first letter of each word
  const nameInitials = team.Name
    ? team.Name
        .split(" ")
        .filter(Boolean)
        .map((word: string) => word.charAt(0))
        .join("")
    : "";

  return locationInitial + nameInitials;
}


export function FullBlobileDisplay({ gameId, awayTeam, homeTeam, game}: {gameId: string, awayTeam: any, homeTeam: any, game: any}){
    const {eventLog} = useGameLiveEvents({ gameId, initialEvents: game.EventLog });
    const lastEvent = game.EventLog[game.EventLog.length - 1];

    let currentQueue: Baserunner[] = [];
    let lastBases: Bases = { first: null, second: null, third: null }; 
    const allPlayerNames = [
        ...awayTeam.Players.map((p: any) => `${p.FirstName} ${p.LastName}`),
        ...homeTeam.Players.map((p: any) => `${p.FirstName} ${p.LastName}`)
    ];

    for (const event of eventLog) {
        const result = ProcessMessage(event, allPlayerNames, currentQueue);
        currentQueue = result.baseQueue;
        lastBases = result.bases;
    }

    return (
        <div>
            <BlobileTeamHeader awayTeam={MapAPITeamResponse(awayTeam)} homeTeam={MapAPITeamResponse(homeTeam)}/>
            <div className='grid grid-cols-1 md:grid-cols-2 w-full bg-[#00A837] items-center'> 
                <BlobileDiamond pitcher={lastEvent.pitcher} batter={lastEvent.batter} first={lastBases.first} second={lastBases.second} third={lastBases.third} weather={game.Weather.Name}/>       
                <BlobileScoreboard inning={lastEvent.inning} isTop={lastEvent.inning_side == 0} isFinal={game.State === "Complete"} balls={lastEvent.balls} outs={lastEvent.outs} strikes={lastEvent.strikes} awayTeam={awayTeam} homeTeam={homeTeam} event={lastEvent}/>
            </div>
        </div>
    );
}

export function BlobileTeamHeader({ awayTeam, homeTeam } : { awayTeam: any, homeTeam: any }) {
    return (
        <div className="bg-[#00A837] w-full p-4 flex">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="flex items-center space-x-2">
              <MiniTeamHeader team={awayTeam} />
              <h1>at</h1>
              <MiniTeamHeader team={homeTeam} />
            </div>
          </div>
          <div className="w-1/2"></div>
        </div>
    );
}

export function BlobileScoreboard({ inning, isTop, isFinal, balls, outs, strikes, awayTeam, homeTeam, event } : { inning: string, isTop: boolean, isFinal: boolean, balls: number, outs: number, strikes: number, awayTeam: any, homeTeam: any, event: any }) {

  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.0"
        preserveAspectRatio="xMinYMin meet"
        viewBox="0 0 640 350"
      >
        <rect
          x="0"
          y="0"
          width="640"
          height="350"
          fill="black"
          stroke="white"
          strokeWidth="16"
        />

        {isFinal ? (
          <text
            x="200"
            y="52"
            textAnchor="end"
            fill="white"
            style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
          >
            FINAL
          </text>
        ) : (
          <>
            <text
              x="110"
              y="52"
              textAnchor="end"
              fill="white"
              style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
            >
              INNING
            </text>
            <rect x="120" y="20" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
            <text x="132" y="52" fill="white" style={{ fontSize: 20 }}>
              {isTop ? "▲" : "▼"}
            </text>
            <text
              x="185"
              y="52"
              fill="white"
              textAnchor="end"
              style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
            >
              {inning}
            </text>
          </>
        )}

        <text
          x="320"
          y="52"
          textAnchor="end"
          fill="white"
          style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
        >
          OUT
        </text>
        <rect x="330" y="20" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
        <text
          x="395"
          y="52"
          fill="white"
          textAnchor="end"
          style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
        >
          {outs ?? '0'}
        </text>

        {isTop ? (
          <image x="505" y="30" width="25" height="25" href="/Baseball_bat.svg" />
        ) : (
          <text x="530" y="52" textAnchor="end" style={{ fontSize: 25 }}>
            ⚾
          </text>
        )}
        <text
          x="495"
          y="52"
          fill="white"
          textAnchor="end"
          style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
        >
          {getTeamInitials(awayTeam)}
        </text>
        <rect x="540" y="20" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
        <text
          x="605"
          y="52"
          fill="white"
          textAnchor="end"
          style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
        >
          {event.away_score}
        </text>

        <text
          x="110"
          y="122"
          fill="white"
          textAnchor="end"
          style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
        >
          BALL
        </text>
        <rect x="120" y="90" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
        <text
          x="185"
          y="122"
          fill="white"
          textAnchor="end"
          style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
        >
          {balls ?? '0'}
        </text>

        <text
          x="320"
          y="122"
          fill="white"
          textAnchor="end"
          style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
        >
          STRIKE
        </text>
        <rect x="330" y="90" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
        <text
          x="395"
          y="122"
          fill="white"
          textAnchor="end"
          style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
        >
          {strikes ?? '0'}
        </text>

        {!isTop ? (
          <image x="505" y="100" width="25" height="25" href="/Baseball_bat.svg" />
        ) : (
          <text x="530" y="122" textAnchor="end" style={{ fontSize: 25 }}>
            ⚾
          </text>
        )}
        <text
          x="495"
          y="122"
          fill="white"
          textAnchor="end"
          style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
        >
          {getTeamInitials(homeTeam)}
        </text>
        <rect x="540" y="90" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
        <text
          x="605"
          y="122"
          fill="white"
          textAnchor="end"
          style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}
        >
          {event.home_score}
        </text>

        <rect x="20" y="160" width="600" height="168" stroke="yellow" strokeWidth="4" fill="none" />
        <foreignObject x="30" y="165" width="580" height="153">
          <div
            style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold", color: "white" }} dangerouslySetInnerHTML={{__html: event.message}}
          >
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}

export default function BlobileDiamond({ pitcher, batter, first, second, third, weather } : {pitcher: string, batter: string, first: string | null, second: string | null, third: string | null, weather: string}) {
  const font = {
    family: 'Arial',
    weight: 'bold',
    size: '16x',
    strokeWidth: '1px',
  };

  const coordinates = {
    pitcher: [330, 290],
    home: [330, 490],
    first: [415, 320],
    second: [330, 205],
    third: [245, 320],
    weather: [630, 500]
  };

  return (
        <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.0"
      preserveAspectRatio="xMinYMin meet"
      viewBox="10 120 635 400"
    >
      <filter id="dropShadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation={3} />
        <feOffset dx={0} dy={0} />
        <feComponentTransfer>
          <feFuncA type="linear" slope={0.4} />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    <g className="strokeme">
      <path
        style={{
          fill: "#00a831",
          fillOpacity: 1,
          fillRule: "evenodd",
          stroke: "none",
          strokeWidth: 1,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeOpacity: 1,
        }}
        d="M 150,520 L 0,520 L 0,0 L 650,0 L 650,520 L 508,520 L 150,520 z "
      />
      {/* dirt */}
      <path
        style={{
          opacity: 1,
          fill: "#a48e28",
          fillOpacity: 1,
          stroke: "#85881b",
          strokeWidth: 1.04379344,
          strokeLinecap: "butt",
          strokeLinejoin: "bevel",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        d="M 205,752.36218 A 95,95 0 0 1 395,752.36218"
        transform="matrix(1.989102,0,0,1.978205,-268.2308,-1169.879)"
      />
      {/* dirt corner (right) */}
      <path
        style={{
          fill: "#00a831",
          fillOpacity: 1,
          fillRule: "evenodd",
          stroke: "none",
          strokeWidth: 1,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeOpacity: 1,
        }}
        d="M 328.5,439.48263 L 538.5,229.48266 L 538.5,439.48263 L 328.5,439.48263 z "
      />
      {/* dirt corner (left) */}
      <path
        style={{
          fill: "#00a831",
          fillOpacity: 1,
          fillRule: "evenodd",
          stroke: "none",
          strokeWidth: 1,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeOpacity: 1,
        }}
        d="M 328.5,439.48263 L 124.5,235.48266 L 123.5,439.48263 L 328.5,439.48263 z "
      />
      {/* diamond grass */}
      <rect
        style={{
          opacity: 1,
          fill: "#00a837",
          fillOpacity: 1,
          stroke: "#85881b",
          strokeWidth: 4.99999857,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        width={168.31494}
        height={168.31494}
        x={-77.781464}
        y={374.03622}
        transform="matrix(0.707107,-0.707107,0.707107,0.707107,0,0)"
      />
      {/* dirt (home) */}
      <path
        style={{
          opacity: 1,
          fill: "#85881b",
          fillOpacity: 1,
          stroke: "none",
          strokeWidth: 1,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        d="M 371 430 A 43 43 0 1 1  285,430 A 43 43 0 1 1  371 430 z"
      />
      {/* pitcher's mound */}
      <path
        style={{
          opacity: 1,
          fill: "#b56700",
          fillOpacity: 1,
          stroke: "#85881b",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        d="M 318 752.36218 A 18 18 0 1 1  282,752.36218 A 18 18 0 1 1  318 752.36218 z"
        transform="translate(28.5,-432.8794)"
      />
      {/* pitcher's plate */}
      <rect
        style={{
          opacity: 1,
          fill: "white",
          fillOpacity: 1,
          stroke: "none",
          strokeWidth: 3,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        width={14}
        height={4}
        x={321.5}
        y={317.4827}
      />
      {/* foul line (right) */}
      <path
        style={{
          fill: "none",
          fillOpacity: 0.75,
          fillRule: "evenodd",
          stroke: "white",
          strokeWidth: 3.01047993,
          strokeLinecap: "square",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        d="M 363.00993,405 C 650.37706,117.62236 650.37706,117.62236 650.37706,117.62236"
      />
      {/* foul line (left) */}
      <path
        style={{
          fill: "none",
          fillOpacity: 0.75,
          fillRule: "evenodd",
          stroke: "white",
          strokeWidth: 3,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        d="M 293.77042,404.99993 C -2.1085256,109.12113 -2.1085256,109.12113 -2.1085256,109.12113"
      />
      {/* batter's box (right) */}
      <rect
        style={{
          opacity: 1,
          fill: "#85881b",
          fillOpacity: 1,
          stroke: "white",
          strokeWidth: 1,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        width={15}
        height={35}
        x={340}
        y={410}
      />
      {/* batter's box (left) */}
      <rect
        style={{
          opacity: 1,
          fill: "#85881b",
          fillOpacity: 1,
          stroke: "white",
          strokeWidth: 1,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        width={15}
        height={35}
        x={300}
        y={410}
      />
      {/* first base */}
      <rect
        style={{
          opacity: 1,
          fill: "white",
          fillOpacity: 1,
          stroke: "none",
          strokeWidth: 3,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        width={10.242652}
        height={10.242652}
        x={531.56042}
        y={-95.300102}
        transform="matrix(0.707107,0.707107,-0.707107,0.707107,0,0)"
      />
      {/* second base */}
      <rect
        style={{
          opacity: 1,
          fill: "white",
          fillOpacity: 1,
          stroke: "none",
          strokeWidth: 3,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        width={10.242655}
        height={10.242655}
        x={369.26904}
        y={-95.643242}
        transform="matrix(0.707107,0.707107,-0.707107,0.707107,0,0)"
      />
      {/* third base */}
      <rect
        style={{
          opacity: 1,
          fill: "white",
          fillOpacity: 1,
          stroke: "none",
          strokeWidth: 3,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        width={10.242649}
        height={10.242649}
        x={369.26904}
        y={66.99128}
        transform="matrix(0.707107,0.707107,-0.707107,0.707107,0,0)"
      />

      {/* home plate */}
      <path
        style={{
          fill: "white",
          fillOpacity: 1,
          stroke: "none",
          strokeWidth: 3,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeOpacity: 1,
        }}
        d="M 320,423 L 335,423 L 335,430.7492 L 327.72761,438 L 320,429.78055 L 320,423 z"
      />
      {/* home border */}
      <path
        style={{
          opacity: 1,
          fill: "white",
          fillOpacity: 1,
          stroke: "none",
          strokeWidth: 3,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
        d="M 295,405 C 295.15103,402.74278 293.1875,403.97917 292.28125,403.46875 C 280.62645,419.16193 280.35712,439.683 291.625,455.65625 C 305.77503,475.71519 333.59731,480.52502 353.65625,466.375 C 373.71519,452.22497 378.52502,424.40269 364.375,404.34375 L 361,405 C 362.65625,407.375 361,405 362.65625,407.375 L 293.875,406.53125 L 295,405 z M 293.875,406.53125 L 362.65625,407.375 C 374.80016,425.99135 370.24983,450.98832 351.9375,463.90625 C 333.20494,477.12061 307.30812,472.67006 294.09375,453.9375 C 283.82751,439.38417 283.83997,421.05606 293.875,406.53125 z"
      />
      {/* Pitcher text */}
      <text
        className="pitcher"
        filter="url(#dropShadow)"
        x={coordinates.pitcher[0]}
        y={coordinates.pitcher[1]}
        textAnchor="middle"
        fontFamily={font.family}
        fontWeight={font.weight}
        fontSize={font.size}
        fill="white"
        stroke="black"
        strokeWidth={font.strokeWidth}
      >
        {pitcher}
      </text>
      {/* Batter text */}
      <text
        className="player-home"
        filter="url(#dropShadow)"
        x={coordinates.home[0]}
        y={coordinates.home[1]}
        textAnchor="middle"
        fontFamily={font.family}
        fontWeight={font.weight}
        fontSize={font.size}
        fill="white"
        stroke="black"
        strokeWidth={font.strokeWidth}
      >
        {batter}
      </text>
      {/* Player 1 */}
      <text
        className="player-1"
        filter="url(#dropShadow)"
        x={coordinates.first[0]}
        y={coordinates.first[1]}
        textAnchor="start"
        fontFamily={font.family}
        fontWeight={font.weight}
        fontSize={font.size}
      >
        <tspan
          fill="white"
          stroke="black"
          strokeWidth={font.strokeWidth}
        >
          {first}
        </tspan>
      </text>
      {/* Player 2 */}
      <text
        className="player-2"
        filter="url(#dropShadow)"
        x={coordinates.second[0]}
        y={coordinates.second[1]}
        textAnchor="middle"
        fontFamily={font.family}
        fontWeight={font.weight}
        fontSize={font.size}
        fill="white"
        stroke="black"
        strokeWidth={font.strokeWidth}
      >
        {second}
      </text>
      {/* Player 3 */}
      <text
        className="player-3"
        filter="url(#dropShadow)"
        x={coordinates.third[0]}
        y={coordinates.third[1]}
        textAnchor="end"
        fontFamily={font.family}
        fontWeight={font.weight}
        fontSize={font.size}
      >
        <tspan
          fill="white"
          stroke="black"
          strokeWidth={font.strokeWidth}
          textAnchor="end"
        >
          {third}
        </tspan>
      </text>
      <text
        className="weather"
        filter="url(#dropShadow)"
        x={coordinates.weather[0]}
        y={coordinates.weather[1]}
        textAnchor="end"
        fontFamily={font.family}
        fontWeight={font.weight}
        fontSize={font.size}
      >
        <tspan
          fill="white"
          stroke="black"
          strokeWidth={font.strokeWidth}
          textAnchor="end"
        >
          Weather: {weather}
        </tspan>
      </text>
    </g>
    </svg>
  );
}

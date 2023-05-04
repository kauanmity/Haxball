var room = HBInit({
    roomName: "My room",
    maxPlayers: 16,
    noPlayer: true,
    public: true,
    token: "" // https://www.haxball.com/headlesstoken
});

var localhost = "http://localhost:"
var porta = "3000"
var sitedb = localhost + porta
var playerdata = new Map();

room.setDefaultStadium("Big");
room.setScoreLimit(5);
room.setTimeLimit(0);

function updateAdmins() {
    var players = room.getPlayerList();
    if (players.length == 0) return;
    if (players.find((player) => player.admin) != null) return;
    room.setPlayerAdmin(players[0].id, true);
}

room.onPlayerJoin = function (player) {
    function addPlayerData() {
		let playerData = {
			name: String(player.name),
			conn: String(player.conn),
			auth: String(player.auth),
			id: String(player.id),
		};
		playerdata.set(player.id, playerData);
    }
    addPlayerData()
    updateAdmins();
    info = playerdata.get(player.id)
}

room.onPlayerLeave = function (player) {
    info = playerdata.get(player.id)
    updateAdmins();
}

room.onPlayerChat = function (player, message){
    info = playerdata.get(player.id)
    message = message.split(/ +/);

    if (["!register"].includes(message[0].toLowerCase())){
        if(!message[1]) return room.sendAnnouncement(`Coloque alguma senha`, player.id)
        if(message[2]) return room.sendAnnouncement(`Não pode haver espaço depois da senha`, player.id)

        fetch(`${sitedb}/contas?nick=${player.name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response =>{
            return response.json()
        })
        .then(data =>{
            if(data.length >= 1){
                room.sendAnnouncement(`Você já tem uma conta no banco de dados`, player.id)
                return false
            }else if(data.length < 1){
            
                let db = {
                    "nick": player.name,
                    "auth": info.auth,
                    "conn": info.conn,
                    "senha": message[1],
                }

                fetch(`${sitedb}/contas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(db),
                })
                room.sendAnnouncement(`Você registrou uma conta\n${JSON.stringify(db)}`, player.id)
                return false
            }
        })
    }
}
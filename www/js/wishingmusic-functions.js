String.prototype.toHHMMSS = function () {
	let sec_num = parseInt(this, 10); // don't forget the second param
	let hours   = Math.floor(sec_num / 3600);
	let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	let seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours   < 10) {hours   = "0"+hours}
	if (minutes < 10) {minutes = "0"+minutes}
	if (seconds < 10) {seconds = "0"+seconds}

	let time = '';
	if (hours 	> 0) {time += hours+':'}
	if (minutes > 0) {time += minutes+':'}
	if (seconds > 0) {time += seconds}
	return time;
}

String.prototype.toMusicHHMMSS = function (duration) {
	let sec_num = parseInt(this, 10); // don't forget the second param
	let hours   = Math.floor(sec_num / 3600);
	let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	let seconds = sec_num - (hours * 3600) - (minutes * 60);

	let duration_sec_num = parseInt(duration, 10); // don't forget the second param
	let duration_hours   = Math.floor(duration_sec_num / 3600);
	let duration_minutes = Math.floor((duration_sec_num - (duration_hours * 3600)) / 60);
	let duration_seconds = duration_sec_num - (duration_hours * 3600) - (duration_minutes * 60);

	if (hours   < 10) {hours   = "0"+hours}
	if (minutes < 10) {minutes = "0"+minutes}
	if (seconds < 10) {seconds = "0"+seconds}

	let time = '';
	if (duration_hours	 > 0) {time += hours+':'}
	if (duration_minutes > 0) {time += minutes+':'}
	if (duration_seconds > 0) {time += seconds}
	return time;
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        let x = a.key,
        	y = b.key;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

/**
 * Créé les notifications
 */
function createNotification(text, title = 'Wishing-Music', icon = 'music_note', subtitle = '', titleRightText = '', closeOnClick = true) {
	return wishingMusicApp.notification.create({
		icon: '<i class="icon material-icons">'+icon+'</i>',
		title: title,
		titleRightText: titleRightText,
		subtitle: subtitle,
		text: text,
		closeOnClick: closeOnClick
	});
}
function openNotification(text, title = 'Wishing-Music', icon = 'music_note', subtitle = '', titleRightText = '') {
	return wishingMusicApp.notification.create({
		icon: '<i class="icon material-icons">'+icon+'</i>',
		title: title,
		titleRightText: titleRightText,
		subtitle: subtitle,
		text: text,
		closeOnClick: true
	}).open();
}

/*
 * Retourne un objet à partir de données json
 */
function getObjectByValue(array, key, value) {
    return (array.filter(function (object) {
        return (object[key] === value);
    }))[0];
};

//Fonction allant récupérer le fichier demandé dans le document demandé sur la base voulue
function downloadMusicFile(db, docName, fileName) {
	db.getAttachment(docName, fileName).then(function (fileBlob) {
		// Écriture du fichier
		writePersistentFile(docName, fileName, fileBlob);
	}).catch(function (err) {
		openNotification(err.toString(), 'Erreur lors de la liaison au serveur', 'sync_disabled');
	});
}

// Fonction écrivant un fichier dans le dossier voulu
function writePersistentFile(directory, fileName, data) {
	// Direction cdvfile://localhost/persistent
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
		// Création du dossier
        fileSystem.root.getDirectory(directory, { create: true }, function(dirEntry) {
        	// Création du fichier
        	dirEntry.getFile(fileName, { create: true }, function(fileEntry) {
        		// Création du writer
        		fileEntry.createWriter(function (fileWriter) {
        			fileWriter.onwriteend = function (e) {
        				// Si le fichier a bien été créé
        				openNotification('Musique téléchargée !', 'Système', 'cloud_done');
        			};
        			fileWriter.onerror = function (e) {
        				// En cas d'erreur d'écriture
        				openNotification('Erreur lors de l\'écriture de la musique', 'Erreur d\'écriture', 'cloud_off');
        			};
        			fileWriter.write(data);
        		}, logException);
        	}, logException);
        }, logException);
    }, logException);
}

// Fonction vérifiant si une musique existe dans l'appareil
// Elle ajoute le champ downloaded dans le document
function checkIfMusicExists(musicDoc, callback){
	// Dossier de fichiers persistants
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
		// Accès au dossier de la musique
		fileSystem.root.getDirectory(musicDoc._id, { create: false }, function(dirEntry) {
			// Si elle existe
			musicDoc.isDownloaded = true;
			callback(musicDoc);
		}, function(ex) {
			// Si elle n'existe pas
			musicDoc.isDownloaded = false;
			callback(musicDoc);
		});
	}, logException);
}

function checkConnection() {
    let networkState = navigator.connection.type;

    let states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Connection type: ' + states[networkState]);
}

// Fonction générant un nombre aléatoire entre 1 et un max excepté certains nombres
function generateRandomExcepts(max, excepts) {
	let nb = Math.floor((Math.random() * max) + 1);
	let row = rowsMusics[nb];
	if (excepts.indexOf(row.doc) != -1) {
		return generateRandomExcepts(max, excepts);
	}
	return nb;
}

/*
 * Fonction générant une chaîne unique GUID
 */
function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

/*
 * Affiche les erreurs
 */
function logException(ex) {
	console.error('Error', ex);
//	alert('Error : ' + ex);
}
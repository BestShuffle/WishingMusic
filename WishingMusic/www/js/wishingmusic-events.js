/**
 * 
 * EVENTS
 * 
 */

//Quand l'appareil est prêt
$$(document).on('deviceready', function() {
	// Connexion à la DB
	// MODE DEBUG
	// PouchDB.debug.enable('*');
	if (device.platform == 'browser' || device.platform == 'iOS') {
		dbInfos = new PouchDB('wishing-infos');
		dbMusics = new PouchDB('wishing-musics');
	} else {
		dbInfos = new PouchDB('wishing-infos', { adapter: 'cordova-sqlite', location: 'default', androidDatabaseImplementation: 2 });
		dbMusics = new PouchDB('wishing-musics', { adapter: 'cordova-sqlite', location: 'default', androidDatabaseImplementation: 2 });
	}

	remoteDbInfos = new PouchDB(remoteDbInfosUrl);
	remoteDbMusics = new PouchDB(remoteDbMusicsUrl);

	//alert('SQLite plugin is installed?: ' + (!!window.sqlitePlugin));
	//alert(db.adapter);

	dbInfos.sync(remoteDbInfos, {
		live: true,
		retry: true
	}).on('change', function(info) {
		// Changement en ligne détecté
		//alert('Change sync : ' + JSON.stringify(change));
		openNotification(info.change.docs.length + ' musique(s) ajoutée(s).', 'Système', 'cloud_done', 'Nouveau contenu téléchargé.');
		loadLocalInfos();
		
	}).on('paused', function (info) {
		// Pause (perte de co / économie)
	}).on('active', function (info) {
		// Reprise de l'activité
		openNotification('Ajout de nouveau contenu..', 'Système', 'cloud_download');
	}).on('complete', function(info) {
		openNotification('Synchronisation stoppée !', 'Système', 'stop');
	}).on('denied', function (err) {
		openNotification(err.toString(), 'Synchronisation refusée !', 'sync_disabled');
	}).on('error', function (err) {
		// Erreur (ne devrait pas arriver)
		openNotification(err.toString(), 'Erreur de synchronisation !', 'sync_problem');
	});

	loadLastMusicsInList('.last-music-ul-list');
	
	loadLocalInfos();
});

//Verouillage
$$(document).on('pause', function (e) {
});

//Retour sur l'appli
$$(document).on('resume', function (e) {
});

$$(document).on('page:init', '.page[data-name="home"]', function (e) {
	loadLastMusicsInList('.last-music-ul-list');
});

$$(document).on('page:init', '.page[data-name="music"]', function (e) {
	let musicSearchBar = wishingMusicApp.searchbar.create({
		el: '.music-searchbar',
		searchContainer: '.music-list',
		searchIn: '.music-search-in',
		on: {
//			search(sb, query, previousQuery) {
//				console.log(query, previousQuery);
//			}
		}
	});
	
	// Tri des musiques
	sortByKey(rowsMusics, "artist");
	
	// Récupération de toutes les musiques et affichage
	let nbTreatedMusics = 0;
	rowsMusics.forEach(function(musicRow) {
		nbTreatedMusics++;
		musicRow.doc.number = nbTreatedMusics;
		// Envoi du document de la musique selon la plateforme
		if (device.platform == 'browser') {
			musicRow.doc.isDownloaded = true;
			addMusicInList(musicRow.doc);
		} else {
			checkIfMusicExists(musicRow.doc, addMusicInList);
		}
	});

	hideMusicToolbar();
	// Si une musique a déjà été chargée on affiche de nouveau la barre
	if (music !== undefined && music !== null) {
		if (music.getState() == Media.MEDIA_STARTING ||
			music.getState() == Media.MEDIA_RUNNING ||
			music.getState() == Media.MEDIA_PAUSED) {
			loadMusicBar();
		}
	}
});

$$(document).on('page:init', '.page[data-name="artists"]', function (e) {
	// Barre de recherche
	let artistSearchBar = wishingMusicApp.searchbar.create({
		el: '.artists-searchbar',
		searchContainer: '.artists-list',
		searchIn: '.artists-search-in'
	});
	
	hideMusicToolbar();
	// Si une musique a déjà été chargée on affiche de nouveau la barre
	if (music !== undefined && music !== null) {
		if (music.getState() == Media.MEDIA_STARTING ||
			music.getState() == Media.MEDIA_RUNNING ||
			music.getState() == Media.MEDIA_PAUSED) {
			loadMusicBar();
		}
	}
});

$$(document).on('page:init', '.page[data-name="upload"]', function (e) {
});

$$(document).on('page:init', '.page[data-name="upload-file"]', function (e) {
});

$$(document).on('page:init', '.page[data-name="upload-youtube"]', function (e) {
	// Connexion
	let ws = new WebSocket(wsUrl, 'json');

	// Events
	ws.onopen = function () {
		// console.log('Connecté au serveur NodeJS WS.');
		// On prévient le serveur du fait que l'on est prêt
		let readyMessage = {
				type: 'ready'
		};
		ws.send(JSON.stringify(readyMessage));
	};
	ws.onclose = function () {
		// console.log('Déconnecté du serveur NodeJS WS.');
	};
	ws.onerror = function (ex) {
		logException(ex);
	};
	ws.onmessage = function (e) {
		// Lorsqu'un message du serveur est reçu
		let message = JSON.parse(e.data);
		switch(message.type) {
		case 'badURL':
			// URL incorrecte
			alert('URL non valide !');
			break;
		case 'updateStatus':
			// Message de status
			let msgDownloadingColor = 'color-red';
			if (message.isDownloading) {
				msgDownloadingColor = 'color-green';
			}
			$$('.downloading-icon').removeClass('color-red color-green');
			$$('.downloading-icon').addClass(msgDownloadingColor);
			$$('.state-zone').html(message.value);
			break;
		default:
			console.log(e.data);
		break;
		}
	};

	// Lors d'un clic sur le bouton Valider
	$$('.btn-upload-ytb').on('click', function (e) {
		// Envoi de l'URL
		let request = {
				url: $$('#youtube-input').val()
		};
		// console.log('Envoi de la requête (' + JSON.stringify(request) + ') au
		// serveur NodeJS WS.');
		ws.send(JSON.stringify(request));
	});
});

$$(document).on('page:init', '.page[data-name="settings"]', function (e) {
});

//Changement de couleur du thème
$$(document).on('page:init', '.page[data-name="settings-theme-color-change"]', function (e) {
	$$('input[name="color-radio"]').on('change', function () {
		if (this.checked) {
			$$('.view').removeClass('color-theme-pink color-theme-blue color-theme-red color-theme-black color-theme-gray color-theme-orange color-theme-yellow color-theme-green color-theme-white');
			$$('.view').addClass('color-theme-' + $$(this).val());
		}
	});
});

//Changement de couleur de layout
$$(document).on('page:init', '.page[data-name="settings-layout-color-change"]', function (e) {
	$$('input[name="layout-radio"]').on('change', function () {
		if (this.checked) {
			if (this.checked) {
				$$('.view').removeClass('theme-white theme-dark');
				$$('.view').addClass(this.value);
			}
		}
	});
});

$$(document).on('page:init', '.page[data-name="musicPage"]', function (e) {
	loadMusicPageEvents();
});
const cdvPersistentUrl = 'cdvfile://localhost/persistent',
remoteProtocol = 'http',
remoteUrl = '172.20.10.6',
remoteDbPort = 5984,
remoteWsPort = 3001,
remoteDbInfosUrl = remoteProtocol+'://'+remoteUrl+':'+remoteDbPort+'/wishing-infos',
remoteDbMusicsUrl = remoteProtocol+'://'+remoteUrl+':'+remoteDbPort+'/wishing-musics',
wsUrl = 'ws://'+remoteUrl+':'+remoteWsPort;

var music,
dbInfos,
dbMusics,
remoteDbInfos,
remoteDbMusics,
rowsMusics;

var playedMusics = [],
actualPlayedMusicsIndex;

/**
 * 
 * FONCTIONS
 * 
 */
function addMusicInList(musicDoc) {
	let musicUlList = $$('.music-ul-list');
	
	musicUlList.append(generateMusicHtml(musicDoc));
	
	$$('.music-'+musicDoc.number).on('click', function(mouseClick) {
		if ($$(event.target).attr('class').includes('music-download'))
			return;
		loadMusicLoadDisplay(this);
	});
	$$('.music-download-'+musicDoc.number).on('click', function(mouseClick) {
		downloadMusic(this);
	});
}

// Fonction de téléchargement de la musique
function downloadMusic(musicItem) {
	let musicDocName = musicItem.dataset.doc;
	// Récupération de la musique en ligne
	downloadMusicFile(remoteDbMusics, musicDocName, 'music.mp3');
	downloadMusicFile(remoteDbMusics, musicDocName, 'image.jpg');
	// Rechargement de la page
	if (wishingMusicApp.views.main.router.url != '/music-page/') {
		wishingMusicApp.views.main.router.refreshPage();
	}
}

function loadMusicLoadDisplay(musicItem) {
	// On charge la musique
	loadMusic(musicItem);

	// Chargement de la barre et démarrage de la musique
	if (wishingMusicApp.views.main.router.url != '/music-page/') {
		loadMusicBar();
	}
	
	startMusicTimer();

	if (device.platform != 'browser') {
		setLockedScreenMusicControls();		
	}
	
	music.play();
}

// Fonction de chargement d'une musique
function loadMusic(musicItem) {
	// Si une musique est jouée stop
	ifPlayingStopMusic();

	// Données transmissibles entre musiques
	let musicVolume,
		isDownloaded,
		isShuffling,
		isRepeating;
	
	// Données concernant la musique
	let	musicDocId,
	musicFileUrl,
	musicImageUrl;
	
	// Chargement des données de la musique selon le type de musicItem
	if (musicItem.dataset !== undefined) {
		// Clic depuis la page music
		isDownloaded = (musicItem.dataset.downloaded == 'true');
		musicDocId = musicItem.dataset.doc;

		if (!actualPlayedMusicsIndex) {
			// Initialisation
			actualPlayedMusicsIndex = 0;
		} else {
			// Pas -1 car pas encore ajouté
			actualPlayedMusicsIndex = playedMusics.length;
		}
	} else if (musicItem._id !== undefined) {
		// Clic depuis la page plein écran d'une musique
		isDownloaded = musicItem.isDownloaded;
		musicDocId = musicItem._id;
	}

	// Si musique téléchargée et utilisateur pas sur navigateur
	musicFileUrl = ((isDownloaded && (device.platform != 'browser')) ? cdvPersistentUrl : remoteDbMusicsUrl)+'/'+musicDocId+'/music.mp3';
	musicImageUrl = ((isDownloaded && (device.platform != 'browser')) ? cdvPersistentUrl : remoteDbMusicsUrl)+'/'+musicDocId+'/image.jpg';

	// Chargement de la musique
	// Si une musique a déjà été chargée une fois, on récupère 
	// son volume sinon 100%
	musicVolume = ((music != null) ? music.volume : 100);
	isRepeating = ((music != null) ? music.isRepeating : false);
	isShuffling = ((music != null) ? music.isShuffling : false);

	let musicRow = getObjectByValue(rowsMusics, 'id', musicDocId);
	let musicDoc = musicRow.doc;
	
	music = new Music(musicDocId, musicDoc.artist, musicDoc.title, musicFileUrl, musicVolume);

	// Définition de toutes les variables spécifiques à WishingMusics
	music.lastPosition = 0;
	music.imageSrc = musicImageUrl;
	music.isDownloaded = isDownloaded;
	music.isRepeating = isRepeating;
	music.isShuffling = isShuffling;
	music.isChangingPosition = false;

	// Ajout de la musique à la liste des musiques jouées
	if (playedMusics.length >= 20) {
		playedMusics.shift();
	}
	if (playedMusics.indexOf(musicDoc) == -1) {
		playedMusics.push(musicDoc);
	}

	// Mise à jour de l'affichage
	updateMusicPageDisplay();
}

function ifPlayingStopMusic() {
	// Si la musique est en cours de lecture on la stoppe
	if (music !== undefined && music != null) {
		if (music.getState() !== undefined &&
				music.getState() != Media.MEDIA_NONE &&
				music.getState() != Media.MEDIA_STARTING) {
			music.stop();
			music.release();
		}
	}
}

function loadMusicPage() {
	// Chargement de la page
	//mainView.router.loadContent(musicPage);
	mainView.router.navigate('/music-page/');
	updateMusicButtonState(isMusicPaused());
}

function loadMusicBar() {
	// Génération de la barre
	let htmlToolbarMusic = '<img class="thumbnail" src="'+music.imageSrc+'">' +
	'<div class="informations marquee"><span>';
	if (music.artist != 'YouTube') {
		htmlToolbarMusic += music.artist+' - '; 
	}
	htmlToolbarMusic += music.title+'</span></div>' +
	'<div class="buttons"><i class="skip-next toolbar-button icon material-icons">skip_next</i>' +
	'<i class="play-pause toolbar-button icon material-icons">play_arrow</i>' +
	'<i class="skip-previous toolbar-button icon material-icons">skip_previous</i>'+
	'</div>';

	// Chargement du contenu
	$$('.toolbar-music').html(htmlToolbarMusic);

	// Si la musique est en pause on affiche le bon bouton
	updateMusicButtonState(isMusicPaused());

	// Évènements
	$$('.toolbar-music').on('click', function(event) {
		if ($$(event.target).attr('class').includes('play-pause') ||
				$$(event.target).attr('class').includes('skip-previous') ||
				$$(event.target).attr('class').includes('skip-next'))
			return;
		loadMusicPage();
	});
	$$('.informations').on('click', function(event) {
		loadMusicPage();
	});
	$$('.thumbnail').on('click', function(event) {
		loadMusicPage();
	});
	$$('.play-pause').on('click', function(event) {
		playPauseMusic();
	});
	$$('.skip-previous').on('click', function(event) {
		playPrevNextMusic(false, true);
	});
	$$('.skip-next').on('click', function(event) {
		playPrevNextMusic(true, true);
	});

	// Affichage de la toolbar
	$$('.toolbar-music').show();
}

function startMusicTimer() {
	// Récupération de la position actuelle chaque seconde
	music.timer = setInterval(function () {
		music.getPosition(
				function (position) {
					/*
					 * On vérifie que la position n'est pas déjà à jour Et
					 * surtout que la postion n'est pas en train de changer
					 */
					if (position > -1
							&& $$('.position-range').val() != position
							&& !music.isChangingPosition) {
						let duration = music.getDuration();
						wishingMusicApp.range.setValue('.position-range-container', position);
						$$('.position-text').text(String(position).toMusicHHMMSS(music.getDuration()));
						if (duration != -1) {
							$$('.duration-text').text(String(duration).toHHMMSS());
							if (wishingMusicApp.range.get('.position-range-container') !== undefined) {
								wishingMusicApp.range.get('.position-range-container').max = duration;
							}
						}
						
						if (position == duration || (position == -0.001 && duration != -1) ) {
							playPrevNextMusic(true, false);
						}

						music.lastPosition = position;
					}
				}, logException
		);
	}, 250);
}

function stopMusicTimer() {
	music.timer = null;
}

function playPrevNextMusic(isNext, isFromButton) {
	// Si la musique doit être répétée
	if (isFromButton == false && music.isRepeating) {
		music.restart();
		return;
	}
	
	let musicDoc = getObjectByValue(rowsMusics, 'id', music.id);
	let newMusicIndex;
	if (isNext) {
		// Si la lecture aléatoire est activée et que l'on va chercher la musique suivante
		if (music.isShuffling) {
			// -1 car rowsMusic commence à 0 
			newMusicIndex = generateRandomExcepts(rowsMusics.length-1, playedMusics);
			// Pas besoin de -1, la musique va être ajoutée
			actualPlayedMusicsIndex = playedMusics.length;
		} else {
			// Musique suivante !
			let newPlayedMusicsIndex = actualPlayedMusicsIndex + 1;
			// Toujours dans les musiques déjà écoutées ?
			if (newPlayedMusicsIndex < playedMusics.length) {
				// Lecture de la musique suivante dans les musiques déjà écoutées
				musicDoc = getObjectByValue(rowsMusics, 'doc', playedMusics[newPlayedMusicsIndex]);
				newMusicIndex = rowsMusics.indexOf(musicDoc);
				actualPlayedMusicsIndex = newPlayedMusicsIndex;
			} else {
				// Lecture de la musique suivante
				newMusicIndex = rowsMusics.indexOf(musicDoc) + 1;
				actualPlayedMusicsIndex = actualPlayedMusicsIndex + 1;
			}
		}
	} else {
		let newPlayedMusicsIndex = actualPlayedMusicsIndex - 1;
		// Toujours dans les musiques déjà écoutées ?
		if (newPlayedMusicsIndex >= 0) {
			// Lecture musique précédente déjà écoutée
			musicDoc = getObjectByValue(rowsMusics, 'doc', playedMusics[newPlayedMusicsIndex]);
			newMusicIndex = rowsMusics.indexOf(musicDoc);
			actualPlayedMusicsIndex = newPlayedMusicsIndex;
		} else {
			// Lecture musique précédente
			newMusicIndex = rowsMusics.indexOf(musicDoc) - 1;
			playedMusics = [];
			// Pas besoin de -1, la musique va être ajoutée
			actualPlayedMusicsIndex = playedMusics.length;
		}
	}

	if (isNext && newMusicIndex == rowsMusics.length) {
		// Si on est déjà à la dernière musique retour à la première
		newMusicIndex = 0;
	} else if (!isNext && newMusicIndex == -1) {
		// Ici l'inverse
		newMusicIndex = rowsMusics.length - 1;
	}
	
	if (newMusicIndex < rowsMusics.length && newMusicIndex >= 0) {
		if (!isNext && music.lastPosition > 5) {
			// Si l'utilisateur est à plus de 5 secondes on remet la musique au départ
			music.restart();
		} else {
			// Sinon on change de musique
			loadMusicLoadDisplay(rowsMusics[newMusicIndex].doc);
		}
	}
	updateMusicButtonState(isMusicPaused());
}

function updateMusicButtonState(isPaused) {
	// Si la musique est en pause on affiche le bouton associé
	if (isPaused) {
		$$('.play-pause').text("play_arrow");
	} else {
		$$('.play-pause').text("pause");
	}
}

function updateMusicPageDisplay() {
	if (wishingMusicApp.views.main.router.url == '/music-page/') {
		$$('.thumbnail').attr('src', music.imageSrc);
		wishingMusicApp.range.setValue('.position-range-container', 0);
		let informations = '';
		if (music.artist != 'YouTube') {
			informations += music.artist + ' - '; 
		}
		informations += music.title;
		$$('.informations').text(informations);
	}
}

function playPauseMusic () {
	/*
	 * Selon si une musique est en cours de lecture ou non on met pause ou play
	 */
	let isPaused = false;
	if (music.getState() == Media.MEDIA_RUNNING) {
		music.pause();
		stopMusicTimer();	
		// Est en pause ou non, true ou false selon si l'ont vient
		// de la barre ou de la page de musique
		isPaused = true;
		if (device.platform != 'browser') {
			// Logiquement son état est l'inverse de 'est en pause'
			MusicControls.updateIsPlaying(!isPaused);
		}
	} else if (music.getState() == Media.MEDIA_PAUSED || music.getState() == Media.MEDIA_STOPPED) {
		startMusicTimer();
		music.play();
		if (device.platform != 'browser') {
			setLockedScreenMusicControls(music);
			MusicControls.updateIsPlaying(true);
		}
	}
	updateMusicButtonState(isPaused);
}

function loadMusicPageEvents() {
	if (music.getState() == Media.MEDIA_RUNNING || music.getState() == Media.MEDIA_PAUSED) {
		wishingMusicApp.range.setValue('.position-range-container', music.lastPosition);
		$$('.position-text').text(String(music.lastPosition).toMusicHHMMSS(music.getDuration()));
	}
	
	// Ajout events
	$$('.position-range-container').touchstart(function(event) {
		music.isChangingPosition = true;
	});
	$$('.position-range-container').touchend(function(event) {
		music.setPosition(wishingMusicApp.range.getValue());
		music.isChangingPosition = false;
	});
	$$('.position-range-container').mousedown(function(event) {
		music.isChangingPosition = true;
	});
	$$('.position-range-container').mouseup(function(event) {
		music.setPosition(wishingMusicApp.range.getValue());
		music.isChangingPosition = false;
	});
	$$('.position-range').on('input', function(event) {
		if (music.isChangingPosition) {
			$$('.position-text').text(String(this.value).toMusicHHMMSS(music.getDuration()));
		}
	});
	$$('.shuffle').click(function(event) {
		music.isShuffling = !music.isShuffling;
		if (music.isShuffling) {
			$$('.shuffle').addClass('button-active');
		} else {
			$$('.shuffle').removeClass('button-active');
		}
	});
	$$('.play-pause').click(function(event) {
		playPauseMusic();
	});
	$$('.skip-previous').click(function(event) {
		playPrevNextMusic(false, true);
	});
	$$('.skip-next').click(function(event) {
		playPrevNextMusic(true, true);
	});
	$$('.repeat').click(function(event) {
		music.isRepeating = !music.isRepeating;
		if (music.isRepeating) {
			$$('.repeat').addClass('button-active');
		} else {
			$$('.repeat').removeClass('button-active');
		}
	});
	$$('.volume').change(function(event) {
		music.setVolume(this.value);
	});
	$$('.volume').on('input', function(event) {
		music.setVolume(this.value);
	});
}

function isMusicPaused() {
	// Si la musique est en pause on affiche le bon bouton
	let isPaused;
	if (music.getState() == Media.MEDIA_PAUSED) {
		isPaused = true;
	}
	return isPaused;
}

//Récupération de toutes les musiques
function loadLocalInfos() {
	wishingMusicApp.preloader.show();
	dbInfos.allDocs({
		include_docs: true,
		attachments: false,
		startkey: 'music'
	}).then(function (musicsJsonList) {
		rowsMusics = musicsJsonList.rows;
		wishingMusicApp.preloader.hide();
	}).catch(function (err) {
		alert('Erreur all docs : ' + err);
	});
}

function hideMusicToolbar() {
	$$('.toolbar-music').hide();
}

function loadLastMusicsInList(list) {
	let lastMusicUlList = $$(list);
	lastMusicUlList.empty();
	remoteDbInfos.changes({
		since: 0,
		descending: true,
		limit: 3
	}).then(function (lastDocsRows) {
		lastDocsRows.results.forEach(function (lastDocsRow) {
		let lastDocId = lastDocsRow.id;
		remoteDbInfos.get(lastDocId).then(function(lastDoc) {
				lastMusicUlList.append(generateLastMusicHtml(lastDoc));
			});
		});
	}).catch(function (err) {
	});
}

/*
 * Barre quand écran verrouillé
 */
function setLockedScreenMusicControls() {
	function musicControlsEvent(action) {
		const message = JSON.parse(action).message;
		switch(message) {
		case 'music-controls-next':
			playPrevNextMusic(true);
			break;
		case 'music-controls-previous':
			playPrevNextMusic(false);
			break;
		case 'music-controls-pause':
			playPauseMusic();
//			MusicControls.updateDismissable(true);
			break;
		case 'music-controls-play':
			playPauseMusic();
//			MusicControls.updateDismissable(true);
			break;
		case 'music-controls-destroy':
			ifPlayingStopMusic();
			hideMusicToolbar();
			if (wishingMusicApp.views.main.router.url == '/music-page/') {
				mainView.router.navigate('/music/');
			}
			break;
			// External controls (iOS only)
		case 'music-controls-toggle-play-pause' :
			playPauseMusic(false, true);
			break;
		case 'music-controls-seek-to':
			const seekToInSeconds = JSON.parse(action).position;
			MusicControls.updateElapsed({
				elapsed: seekToInSeconds,
				isPlaying: true
			});
			// Do something
			break;

			// Headset events (Android only)
			// All media button events are listed below
		case 'music-controls-media-button' :
			// Do something
			break;
		case 'music-controls-headset-unplugged':
			// Do something
			break;
		case 'music-controls-headset-plugged':
			// Do something
			break;
		default:
			break;
		}
	}

	let musicImageHardPath = cordova.file.dataDirectory + 'files/' + music.id + '/image.jpg';
	MusicControls.create({
		track       : music.title,		// optional, default : ''
		artist      : music.artist,		// optional, default : ''
		cover       : ((music.isDownloaded) ? musicImageHardPath : music.imageSrc),		// optional, default : nothing
		// cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
		//			 or a remote url ('http://...', 'https://...', 'ftp://...')
		isPlaying   : true,							// optional, default : true
		dismissable : true,							// optional, default : false

		// hide previous/next/close buttons:
		hasPrev   : true,		// show previous button, optional, default: true
		hasNext   : true,		// show next button, optional, default: true
		hasClose  : true,		// show close button, optional, default: false

		// iOS only, optional
//		album       : 'Absolution',     // optional, default: ''
		duration : music.getDuration(), // optional, default: 0
//		elapsed : music., // optional, default: 0
//		hasSkipForward : true, //optional, default: false. true value overrides hasNext.
//		hasSkipBackward : true, //optional, default: false. true value overrides hasPrev.
		skipForwardInterval : 15, //optional. default: 0.
		skipBackwardInterval : 15, //optional. default: 0.
//		hasScrubbing : false, //optional. default to false. Enable scrubbing from control center progress bar 

		// Android only, optional
		// text displayed in the status bar when the notification (and the ticker) are updated
		ticker: 'Joue la musique "'+music.title+'"',
		//All icons default to their built-in android equivalents
		//The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
		playIcon: 'media_play',
		pauseIcon: 'media_pause',
		prevIcon: 'media_prev',
		nextIcon: 'media_next',
		closeIcon: 'media_close',
		notificationIcon: 'notification'
	}, function() {

	}, logException);

	MusicControls.subscribe(musicControlsEvent);

	MusicControls.listen();
}

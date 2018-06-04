/**
 * Classes
 */
class Music {
	constructor(id, artist, title, musicSrc, volume) {
		this.id = id;
		this.artist = artist;
		this.title = title;
		this.volume = volume;
		
		this.media = new Media(musicSrc,
			function () {
				if (this.callbackSuccess !== undefined)
					this.callbackSuccess();
			},
			function (ex) {
				if (this.callbackError !== undefined)
					this.callbackError();
				else
					console.error(ex);
			},
			function (newState) {
				if (this.callbackState !== undefined)
					this.callbackState(newState);
				if (newState == Media.MEDIA_STARTING)
					this.setVolume(volume/100);
				
				this.state = newState;
			}
		);
	}
	getState() {
		return this.media.state;
	}
	getDuration() {
		return this.media.getDuration();
	}
	getPosition(success, fail) {
		// On envoie les fonctions de réussite et fail
		return this.media.getCurrentPosition(success, fail);
	}
	setPosition(position) {
		this.media.seekTo(position*1000);
	}
	setVolume(percent) {
		/*
		 * On vérifie qu'une musique est chargée
		 * et qu'elle n'est pas stoppée
		 */
		if (this.getState() != Media.MEDIA_NONE &&
				this.getState() != Media.MEDIA_STOPPED) {
			this.volume = percent;
			this.media.setVolume(percent/100);
		}
	}
	play(params) {
		// S'il n'y a aucun paramètre on en utilise pas
		if (typeof params === undefined) {
			this.media.play();
		} else {
			this.media.play(params);
		}
	}
	pause() {
		/*
		 * On vérifie qu'une musique est chargée,
		 * qu'elle n'est pas en chargement ni stoppée
		 */
		if (this.getState() != Media.MEDIA_NONE &&
				this.getState() != Media.MEDIA_STARTING &&
				this.getState() != Media.MEDIA_STOPPED) {
			this.media.pause();
		}
	}
	restart() {
		/*
		 * On vérifie qu'une musique est chargée
		 */
		if (this.getState() != Media.MEDIA_NONE) {
			this.stop();
			this.play();
		}
	}
	stop() {
		/*
		 * On vérifie qu'une musique est chargée
		 * et qu'elle n'est pas stoppée
		 */
		if (this.getState() != Media.MEDIA_NONE &&
				this.getState() != Media.MEDIA_STOPPED) {
			this.media.stop();
		}
	}
	release() {
		// On vérifie qu'une musique est chargée
		if (this.getState() != Media.MEDIA_NONE) {
			this.media.release();
		}
	}
}
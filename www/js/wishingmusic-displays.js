function generateMusicHtml(musicDoc) {
	let imgBaseUrl = ((musicDoc.isDownloaded && (device.platform != 'browser')) ? cdvPersistentUrl : remoteDbMusicsUrl) +'/'+musicDoc._id;
	let generatedHtml = '<li class="music music-'+musicDoc.number+'" data-doc="'+musicDoc._id+'" data-downloaded="'+musicDoc.isDownloaded+'"><a href="#" class="item-link item-content">' +
	'	<div class="item-media">' +
	'<i class="icon material-icons ' +
	// Si la musique est déjà téléchargée
	((musicDoc.isDownloaded) ? 'color-green">cloud_done' : 'music-download-'+musicDoc.number+'" data-doc="'+musicDoc._id+'">cloud_download') +
	'</i>'+
	'		<img class="music-image" src="'+imgBaseUrl+'/image.jpg">' +
	'	</div>' +
	'	<div class="item-inner">' +
	'		<div class="item-title-row">' +
	'			<div class="music-search-in title item-title">'+musicDoc.title+'</div>' +
	'		</div>' +
	'		<div class="music-search-in artist item-subtitle">'+musicDoc.artist+'</div>' +
	'	</div>' +
	'</a></li>';
	return generatedHtml;
}

function generateMusicPageHtml() {
	// Génération de la page
	let html = '<div data-name="musicPage" class="page">' +
	'	<div class="music-page page-content">' +
	'		<img class="thumbnail" src="'+music.imageSrc+'">' +
	'		<div class="position-range-container range-slider range-slider-init">' +
	'			<input class="position-range" type="range" min="0" max="'+music.getDuration()+'" value="0" step=".000001" />' +
	'		</div>' +
	'		<div class="position-duration-container">' +
	'			<p class="position-text">'+String(music.lastPosition).toMusicHHMMSS(music.getDuration())+'</p>' +
	'			<p class="duration-text">'+String(music.getDuration()).toHHMMSS()+'</p>' +
	'		</div>' +
	'		<p class="informations">';
	if (music.artist != 'YouTube') {
		html += music.artist + ' - ';
	}
	html += music.title + '</p>' +
	'		<div class="controls list simple-list no-hairlines">' +
	' 			<ul>' +
	'				<li>' +
	'					<div class="item-cell width-auto flex-shrink-0">' +
	'						<i class="shuffle music-page-button icon material-icons md-28';
	if (music.isShuffling) {
		html += ' button-active';
	}
	html += '">shuffle</i>' +
	'					</div>' +
	'					<div class="item-cell width-auto flex-shrink-3">' +
	'						<i class="skip-previous music-page-button icon material-icons md-40">skip_previous</i>' +
	'						<i class="play-pause music-page-button icon material-icons md-52">play_arrow</i>' +
	'						<i class="skip-next music-page-button icon material-icons md-40">skip_next</i>' +
	'					</div>' +
	'					<div class="item-cell width-auto flex-shrink-0">' +
	'						<i class="repeat music-page-button icon material-icons md-28';
	if (music.isRepeating) {
		html += ' button-active';
	}
	html += '">repeat</i>' +
	'					</div>' +
	'				</li>' +
	'			</ul>' +
	'		</div>' +
	'		<div class="volume-container list simple-list no-hairlines">' +
	' 			<ul>' +
	'				<li>' +
	'					<div class="item-cell width-auto flex-shrink-0">' +
	'						<i class="icon material-icons md-18">volume_down</i>' +
	'					</div>' +
	'					<div class="item-cell flex-shrink-3">' +
	'						<div class="range-slider range-slider-init" data-label="true">' +
	'							<input class="volume" type="range" min="0" max="100" value="'+music.volume+'" step="1" />' +
	'						</div>' +
	'					</div>' +
	'					<div class="item-cell width-auto flex-shrink-0">' +
	'						<i class="icon material-icons md-18">volume_up</i>' +
	'					</div>' +
	'				</li>' +
	'			</ul>' +
	'		</div>' +
	'	</div>' +
	'</div>';
	
	return html;
}

function generateLastMusicHtml(lastDoc) {
	let imgBaseUrl = remoteDbMusicsUrl + '/' + lastDoc._id;
	let generatedHtml = '<li class="music item-content">' +
	'	<div class="item-media">' +
	'		<img class="music-image" src="'+imgBaseUrl+'/image.jpg">' +
	'	</div>' +
	'	<div class="item-inner">' +
	'		<div class="item-title-row">' +
	'			<div class="music-search-in title item-title">'+lastDoc.title+'</div>' +
	'		</div>' +
	'		<div class="music-search-in artist item-subtitle">'+lastDoc.artist+'</div>' +
	'	</div>' +
	'</li>';
	return generatedHtml;
}
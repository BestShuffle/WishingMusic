var wishingMusicApp = new Framework7({
	id: "fr.wishingmusic",
	name: "Wishing Music",
	theme: 'md',
	touch: {
		disableContextMenu: false,
		tapHold: true,
		tapHoldPreventClicks: false
	},
	routes: [
		{
			name: 'home',
			path: '/',
			url: './index.html'
		},
		{
			name: 'artists',
			path: '/artists/',
			url: './artists.html'
		},
		{
			name: 'music',
			path: '/music/',
			url: './music.html'
		},
		{
			name: 'upload',
			path: '/upload/',
			url: './upload.html'
		},
		{
			name: 'upload-file',
			path: '/upload-file/',
			url: './upload-file.html'
		},
		{
			name: 'upload-youtube',
			path: '/upload-youtube/',
			url: './upload-youtube.html'
		},
		{
			name: 'settings',
			path: '/settings/',
			url: './settings.html'
		},
		{
			name: 'settings-theme-color-change',
			path: '/settings-theme-color-change/',
			url: './settings-theme-color-change.html'
		},
		{
			name: 'settings-layout-color-change',
			path: '/settings-layout-color-change/',
			url: './settings-layout-color-change.html'
		},
		{
			path: '/music-page/',
			component:{
				render:function(){
					return Template7.compile(generateMusicPageHtml())(this);
				}
			}
		}
		]
});

var $$ = Dom7;

var mainView = wishingMusicApp.views.create('.view-main', {
	dynamicNavbar: true
});
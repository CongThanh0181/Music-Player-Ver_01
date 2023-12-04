//fake data
import {baoAnh} from '../FakeData/baoAnh.js';
import {rapViet} from '../FakeData/rapViet.js';
var dataMusic = baoAnh.concat(rapViet);

// Chọn DOM
var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

var musicPlaylist = $('.music-playlist');
var cdThumb = $('.cd-thumb');
var cd = $('.cd');
var songName = $('.music-player h1');
var audio = $('#audio');
var toggleBtn = $('.btn-toggle-play');
var playBtn = $('.fa-play');
var pauseBtn = $('.fa-pause');
var currentTime = $('.time-range .current-time');
var totalTime = $('.time-range .total-time');
var progress = $('#progress');
var nextBtn = $('.btn-next');
var prevBtn = $('.btn-prev');
var repeatBtn = $('.btn-repeat');
var randomBtn = $('.btn-random');



//Object app chính

const app = {
    //các property
    currentIndex: 0,
    isPlay: false,
    isRepeat: false,
    isRandom: false,


    //các method
    //method render list music
    render: function(){
        let htmls = dataMusic.map((element, index) => {
            let html = 
                `<div class="playlist-item" data-index="${index}">
                    <div class="item-thumb" style="background-image: url(${element.imageUrl}), url(../Image/cd-thumb.png)"></div>
                    <div class="info-music">
                    <h2 class="music-name">${element.musicName}</h2>
                    <span class="music-singer">${element.singer}</span>
                    </div>
                    <div class="btn option-btn">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`
            return html;
        });

        musicPlaylist.innerHTML = htmls.join('');
    },

    //cuộn tới list nhạc đang nghe
    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.active-item-list').scrollIntoView({ 
                behavior: "smooth", 
                block: "center"
            })
        }, 300)
    },

    //load current song lên music player
    loadCurrentSong: function(){
        songName.innerHTML = dataMusic[this.currentIndex].musicName;
        cdThumb.style.backgroundImage = `url(${dataMusic[this.currentIndex].imageUrl}), url(../Image/cd-thumb.png)`;
        audio.src = dataMusic[this.currentIndex].songUrl;
        currentTime.innerHTML = `0:0`;
        totalTime.innerHTML = `0:00`;

        //active item của danh sách nhạc
        let listSong = $$('.playlist-item');
        listSong.forEach((element, index) => {
            if(index == app.currentIndex){
                element.classList.add('active-item-list');
            }else{
                element.classList.remove('active-item-list');
            }
        });
        
    },

    //Next song
    nextSong: function() {
            if(!app.isRandom){
                app.currentIndex++;
                if(app.currentIndex > dataMusic.length - 1){
                    app.currentIndex = 0;
                }
            }else{
                app.currentIndex = Math.floor(Math.random() * dataMusic.length);
            }

            app.loadCurrentSong();
            app.scrollToActiveSong();
            audio.play();
    },

    //Prev song
    prevSong: function() {
        if(!app.isRandom){
            app.currentIndex--;
            if(app.currentIndex < 0){
                app.currentIndex = dataMusic.length-1;
            }
        }else{
            app.currentIndex = Math.floor(Math.random() * dataMusic.length);
        }

        app.loadCurrentSong();
        app.scrollToActiveSong();
        audio.play();
    },

    //method xử lý các sự kiện user tương tác
    handleEvents: function(){
        //xử lý sự kiện kéo list music
        document.onscroll = function(){
            let cdSize = 200 - window.scrollY;
            cd.style.width = `${cdSize < 0 ? 0 : cdSize}px`;
            cdThumb.style.opacity = `${100 - window.scrollY / 2}%`;
        }

        //xử lý quay cd (chưa hiểu tại sao viết ra hàm ngoài rồi gọi vào lại không chạy?)
        let animateCd = cd.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        animateCd.pause();

        //xử lý sự kiện click play-pause
        toggleBtn.onclick = function(){
            if(app.isPlay){
                audio.pause(); 
            }else{
                audio.play();
            }
        }

        //xử lý btn khi được play và pause
        audio.onplay = function() {
            playBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            app.isPlay = true;
            animateCd.play();
        }
        audio.onpause = function() {
            playBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
            app.isPlay = false;
            animateCd.pause();
        }

        //xử lý thanh thời lượng bài hát
        audio.ontimeupdate = function() {
            //Thời gian hiện tại
            let totalSecondCurent = audio.currentTime.toFixed(0);
            let secondCurrent = totalSecondCurent % 60;
                // format kiểu số của giây
            let formattedSecond = secondCurrent.toString().padStart(2, '0');
            let minuteCurrent = Math.floor(totalSecondCurent / 60);
            currentTime.innerHTML = `${minuteCurrent}:${formattedSecond}`;
            
            //Thời gian tổng của song
            if(audio.duration){
                let totalSecond = audio.duration.toFixed(0);
                let second = (totalSecond % 60).toString().padStart(2, '0');
                let minute = Math.floor(totalSecond / 60);
                totalTime.innerHTML = `${minute}:${second}`;

                let percentProgress = audio.currentTime / (audio.duration / 100);
                progress.value = `${percentProgress}`;
            }
        }

        //xử lý sự kiện khi audio hết
        audio.onended = function() {
            // nếu chạy hết -> next song
            if(app.isRepeat === false && app.isRandom === false){
                app.nextSong();
            }
            // nếu repeat -> chạy lại song
            else if(app.isRepeat === true){
                audio.play();
            }
            //nếu random -> chạy song random
            else if(app.isRandom === true){
                app.nextSong();
            }
        }

        //xử lý khi tua, khéo thanh thời gian
        progress.oninput = function(e) {
            audio.currentTime = (audio.duration / 100) * e.target.value;
            audio.play();
        }

        //xử lý khi ấn next / prev
        nextBtn.onclick = function() {
            app.nextSong();
        }
        prevBtn.onclick = function() {
            app.prevSong();
        }

        //xử lý khi ấn repeat
        repeatBtn.onclick = function() {
            if(app.isRepeat){
                repeatBtn.classList.remove('active-btn');
                app.isRepeat = false;
            }else{
                repeatBtn.classList.add('active-btn');
                randomBtn.classList.remove('active-btn');
                app.isRandom = false;
                app.isRepeat = true;
            }
            
        }

        //xử lý khi ấn random
        randomBtn.onclick = function() {
            if(app.isRandom){
                randomBtn.classList.remove('active-btn');
                app.isRandom = false;
            }else{
                randomBtn.classList.add('active-btn');
                repeatBtn.classList.remove('active-btn');
                app.isRepeat = false;
                app.isRandom = true;
            }
            
        }

        //xử lý khi click vào item list music, item thuộc playlist nên ta lắng nghe sự kiện tại playlist
        musicPlaylist.onclick = function(element) {
            let songNode = element.target.closest('.playlist-item:not(.active-item-list)');

            if(songNode || element.target.closest('.option-btn')){

                //xử lý khi click vào song
                if(songNode){
                    //console.log(songNode.getAttribute('data-index'));
                    app.currentIndex = songNode.getAttribute('data-index');
                    app.loadCurrentSong();
                    audio.play();
                }


                //xử lý khi click vào option
                if(element.target.closest('.option-btn')){
                    //todo
                }
            }
        }

    },
    
    //method start app
    start: function(){
        // render playlist
        this.render();
        this.loadCurrentSong();

        // xử lý các sự kiện
        this.handleEvents();
        
      
    }
}

// chạy app
app.start();
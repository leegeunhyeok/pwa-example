(function () {
  'use strict';

  var app = {
    images: [],
    imageArea: document.getElementById('image-area')
  };
  
  /**
   * @description images에 있는 이미지들을 HTML에 생성하여 표시
   */
  app.showImage = function () {
    this.imageArea.innerHTML = '';
    this.images.forEach(image => {
      var imageDiv = document.createElement('div');
      var img = document.createElement('img');
      img.src = image;
      imageDiv.classList.add('image');
      imageDiv.appendChild(img);
      this.imageArea.appendChild(imageDiv);
    });
  }

  /**
   * @description app 객체에 있는 이미지 리스트를 로컬저장소에 저장
   */
  app.saveImageList = function () {
    localStorage.setItem('images', JSON.stringify(this.images));
  }

  // 이미지 리스트 불러오기, 데이터가 없을 경우 ['images/1.jpg']로 대체
  app.images = JSON.parse(localStorage.getItem('images')) || ['images/1.jpg'];
  app.saveImageList();
  app.showImage();

  // window.onload
  window.onload = () => {
    // 이미지 추가
    document.getElementById('add').onclick = function () {
      let length = app.images.length;
      if (length < 5) {
        app.images.push(`images/${app.images.length + 1}.jpg`);
        app.saveImageList();
        app.showImage();
      } else {
        alert('이미지는 최대 5장입니다.');
      }
    }

    // 이미지 제거
    document.getElementById('sub').onclick = function () {
      let length = app.images.length;
      if (length > 0) {
        app.images.splice(-1, 1);
        app.saveImageList();
        app.showImage();
      }
    }
  }

  // TODO: 아래에 서비스워커 등록

})();

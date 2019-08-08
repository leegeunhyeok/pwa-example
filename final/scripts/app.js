(function () {
  'use strict';

  let appServerPublicKey = 'BONL83gwQ5TqcrC6UfQH2sWB0EDg09GqxFh5PbRg7TTl1iZQekisRNVLW_yn_SZvqWq0kKi75VSMBDLer-mRdZs';
  let isSubscribed = false; 
  let swRegist = null;

  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const app = {
    images: [],
    imageArea: document.getElementById('image-area')
  };
  
  /**
   * @description images에 있는 이미지들을 HTML에 생성하여 표시
   */
  app.showImage = function () {
    this.imageArea.innerHTML = '';
    this.images.forEach(image => {
      let imageDiv = document.createElement('div');
      let img = document.createElement('img');
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

  /*========== TODO: 아래에 Push 관련 로직 구현 ========== */
  // 구독 버튼 상태 갱신
  function updateButton () {
    // TODO: 알림 권한 거부 처리
    if (Notification.permission === 'denied') {
      pushButton.textContent = 'Push Messaging Blocked';
      pushButton.disabled = true;
      updateSubscription(null);
      return;
    }

    const pushButton = document.getElementById('subscribe')
    if (isSubscribed) {
      pushButton.textContent = 'Disable Push Messaging';
    } else {
      pushButton.textContent = 'Enable Push Messaging';
    }
    pushButton.disabled = false;
  }

  // 구독 정보 갱신
  function updateSubscription (subscription) {
    // TODO: 구독 정보 서버로 전송

    let detailArea = document.getElementById('subscription_detail')

    if (subscription) {
      detailArea.innerText = JSON.stringify(subscription)
      detailArea.parentElement.classList.remove('hide')
    } else {
      detailArea.parentElement.classList.add('hide')
    }
  }

  // 알림 구독
  function subscribe () {
    const applicationServerKey = urlB64ToUint8Array(appServerPublicKey);
    swRegist.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(subscription => {
      console.log('User is subscribed.');
      updateSubscription(subscription);
      isSubscribed = true;
      updateButton();
    })
    .catch(err => {
      console.log('Failed to subscribe the user: ', err);
      updateButton();
    });
  }

  // 알림 구독 취소
  function unsubscribe () {
    swRegist.pushManager.getSubscription()
      .then(subscription => {
        if (subscription) {
          return subscription.unsubscribe();
        }
      })
      .catch(error => {
        console.log('Error unsubscribing', error);
      })
      .then(() => {
        updateSubscription(null);
        console.log('User is unsubscribed.');
        isSubscribed = false;
        updateButton();
      });
  }

  // Push 초기화
  function initPush () {
    const pushButton = document.getElementById('subscribe')
    pushButton.addEventListener('click', () => {
      if (isSubscribed) {
        // TODO: 구독 취소 처리
        unsubscribe();
      } else {
        subscribe();
      }
    });

    swRegist.pushManager.getSubscription()
      .then(function(subscription) {
        isSubscribed = !(subscription === null);
        updateSubscription(subscription);

        if (isSubscribed) {
          console.log('User IS subscribed.');
        } else {
          console.log('User is NOT subscribed.');
        }

        updateButton();
      });
  }


  // TODO: 아래에 서비스워커 등록
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(regist => {
      swRegist = regist;
      console.log('Service Worker Registered');

      // TODO: Push 기능 초기화
      initPush();

      regist.addEventListener('updatefound', () => {
        const newWorker = regist.installing;
        console.log('Service Worker update found!');

        newWorker.addEventListener('statechange', function () {
          console.log('Service Worker state changed:', this.state);
        });
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Controller changed');
    });
  }

})();

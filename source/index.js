import Push from 'push.js';

export class Loop
{
    constructor() {
      // https://developers.google.com/web/fundamentals/getting-started/codelabs/push-notifications/
      // https://github.com/web-push-libs/web-push-php
      // private key: zqFkkwkZaELFUpBzFgUyVxC6ub65Uwp45l0rMeqfXQM
        
        this.applicationServerPublicKey = 'BAIXDJo1XjYkjfyn5buBI-LSGRvzXTJrl7pcom2S3MneH_2nWSNai1rbNm34Pu2w2Xa5RmMke-bVM9YUsAIY9kU';
        this.pushButton = document.querySelector('.btnNotify');
        this.isSubscribed = false;
        this.swRegistration = null;
        
        this.setup();
    }

    
    urlB64ToUint8Array(base64String) {
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


    // https://developers.google.com/web/fundamentals/getting-started/codelabs/push-notifications/
    
    setup(){
        var that = this; // otherwise we will lose our local class scope
        
        if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        navigator.serviceWorker.register('loop_sw.js')
                .then(function(swReg) {
                    console.log('Service Worker is registered', swReg);

                    that.swRegistration = swReg;
                    that.initialiseUI();
                })
                .catch(function(error) {
                    console.error('Service Worker Error', error);
                });
        } else {
            console.warn('Push messaging is not supported');
            //this.pushButton.textContent = 'Push Not Supported';
        }
    }
    


    initialiseUI() {
        var that = this;
        
        this.pushButton.addEventListener('click', function() {
            that.pushButton.disabled = true;
            if (that.isSubscribed) {
                that.unsubscribeUser();
            } else {
                that.subscribeUser();
            }
        });

        // Set the initial subscription value
        this.swRegistration.pushManager.getSubscription()
                .then(function(subscription) {
                    that.isSubscribed = !(subscription === null);

                    that.updateSubscriptionOnServer(subscription);

                    if (that.isSubscribed) {
                        console.log('User IS subscribed.');
                    } else {
                        console.log('User is NOT subscribed.');
                    }

                    that.updateBtn();
                });
    }

    unsubscribeUser() {
        var that = this;
        
        this.swRegistration.pushManager.getSubscription()
                .then(function(subscription) {
                    if (subscription) {
                        return subscription.unsubscribe();
                    }
                })
                .catch(function(error) {
                    console.log('Error unsubscribing', error);
                })
                .then(function() {
                    that.updateSubscriptionOnServer(null);

                    console.log('User is unsubscribed.');
                    that.isSubscribed = false;

                    that.updateBtn();
                });
    }

    subscribeUser() {
        var that = this;
        
        const applicationServerKey = this.urlB64ToUint8Array(this.applicationServerPublicKey);
        this.swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                })
                .then(function(subscription) {
                    console.log('User is subscribed:', subscription);

                    that.updateSubscriptionOnServer(subscription);

                    that.isSubscribed = true;

                    that.updateBtn();
                })
                .catch(function(err) {
                    console.log('Failed to subscribe the user: ', err);
                    that.updateBtn();
                });
    }

    updateBtn() {
        
        if (Notification.permission === 'denied') {
            this.pushButton.textContent = 'Push Messaging Blocked.';
            this.pushButton.disabled = true;
            this.updateSubscriptionOnServer(null);
            return;
        }


        if (this.isSubscribed) {
            this.pushButton.textContent = 'Disable Push Messaging';
        } else {
            this.pushButton.textContent = 'Enable Push Messaging';
        }

        this.pushButton.disabled = false;
    }



    updateSubscriptionOnServer(subscription) {
        // TODO: Send subscription to application server

        const subscriptionJson = document.querySelector('.js-subscription-json');
        const subscriptionDetails =
                document.querySelector('.js-subscription-details');

        if (subscription) {
            subscriptionJson.textContent = JSON.stringify(subscription);
            subscriptionDetails.classList.remove('is-invisible');
        } else {
            subscriptionDetails.classList.add('is-invisible');
        }
    }
    

    /*
        Show a new notification
    */
    showNotification() {
        
        Push.create("Hello world!", {
            body: "How's it hangin'?",
            icon: 'icon.png',
            timeout: 4000,
            onClick: function () {
                window.focus();
                this.close();
            }
        });
    }
}
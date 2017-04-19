import Push from 'push.js';
import axios from 'axios/dist/axios';

export class Loop
{
    constructor(p_options) {
      // https://developers.google.com/web/fundamentals/getting-started/codelabs/push-notifications/
      // https://github.com/web-push-libs/web-push-php
        
        this.applicationServerPublicKey = 'BG79+VKll7YW6EQLB1V1Yq2qW134m4Dya1ST5TFgeMARbiueUcZ4qU7lnoElfoKSaJ4h8BdfKnnQXY09gBMwnEA=';
        this.isSubscribed = false;
        this.swRegistration = null;
        
        this.options = p_options;

        // show a push button or not
        this.options.button = p_options.button || {}; 
        this.options.button.enable = p_options.button.enable || false;
        this.options.button.target = p_options.button.target || null;
        this.options.button.textSubscribe = p_options.button.textSubscribe || "Not Receiving Notifications";
        this.options.button.textUnsubscribe = p_options.button.textUnsubscribe || "Receiving Notifications";
        this.options.button.textBlocked = p_options.button.textBlocked || "Notifications are blocked";

        // ask to subscribe to notifications automatically by default
        this.options.autosubscribe = p_options.autoSubscribe || true;
        
        // load all necessary setup stuff
        this.setup();
    }

    setServer(){
        console.log("Setting server.");
        // only used during development to change the test server
        if(this.options.development){
            // only used in active development
            this.server = "http://loop.goodbytes.local";
            console.log("Development server set.");
        }
        else
        {
            this.server = "https://loop.goodbytes.be";
        }
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

    setRequestHeaders(API_KEY) {
        console.log("Setting API key");
        axios.defaults.headers.common = {
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization' : 'Bearer ' + API_KEY
        };
    }
    
    // https://developers.google.com/web/fundamentals/getting-started/codelabs/push-notifications/
    
    setup(){
        this.setRequestHeaders(this.options.API_KEY);
        this.setServer();

        var that = this; // otherwise we will lose our local class scope
        
        if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        navigator.serviceWorker.register('/loop_sw.js')
                .then(function(swReg) {
                    console.log('Service Worker is registered', swReg);

                    that.swRegistration = swReg;
                    
                    that.createButton();
                    
                })
                .catch(function(error) {
                    console.error('Service Worker Error', error);
                });
        } else {
            console.warn('Push messaging is not supported');
            //this.pushButton.textContent = 'Push Not Supported';
        }
    }
    
    createButton(){
        var that = this;

        // create a push button in the target element specified and return that instance
        let button = document.createElement("a");
        let spanIcon = document.createElement("span");
        spanIcon.setAttribute("id", "loopGoodBytesJsButtonIcon");

        let spanText = document.createElement("span");
        spanText.setAttribute("id", "loopGoodBytesJsButtonText");

        button.appendChild(spanIcon);
        button.appendChild(spanText);

        button.setAttribute("id", "loopGoodBytesJsButton");
        // inject the stylesheet for this bad boy
        var link = document.createElement("link");
        if(this.options.testCss == true) {
            link.href = "css/Loop.css";    
        }
        else {
            link.href = "https://loop.goodbytes.be/sdks/Loop.css";
        }
        link.type = "text/css";
        link.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(link);

        document.querySelector(this.options.button.target).appendChild(button);
        this.pushButton = button;
        this.pushButtonIcon = spanIcon;
        this.pushButtonText = spanText;
        
        this.pushButton.addEventListener('click', function() {
            if (that.isSubscribed) {
                that.unsubscribeUser();
            } else {
                that.subscribeUser();
            }
        });

        this.initialiseUI();
    }

    initialiseUI() {
        // store local this scope in that
        var that = this;
        
        // Set the initial subscription value
        this.swRegistration.pushManager.getSubscription()
                .then(function(subscription) {
                    that.isSubscribed = !(subscription === null);

                    that.updateSubscriptionOnServer(subscription);

                    if (that.isSubscribed) {
                        console.log('User IS subscribed.');
                    } else {
                        console.log('User is NOT subscribed.');

                        // when autoSubscribe is enabled, try so subscribe our user
                        if( that.options.autoSubscribe == true ){
                            that.subscribeUser();
                        }
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
            this.pushButtonText.textContent = this.options.button.textBlocked;
            this.pushButton.setAttribute("class", "loopGoodBytesJsButtonBlocked");
            this.updateSubscriptionOnServer(null);
            return;
        }

        if (this.isSubscribed) {
            this.pushButtonText.textContent = this.options.button.textUnsubscribe;
            this.pushButton.setAttribute("class", "loopGoodBytesJsButtonSubscribed");
        } else {
            this.pushButtonText.textContent = this.options.button.textSubscribe;
            this.pushButton.setAttribute("class", "loopGoodBytesJsButtonUnsubscribed");
        }
    }



    updateSubscriptionOnServer(subscription) {
        var that = this;

        // TODO: Send subscription to application server

        //const subscriptionJson = document.querySelector('.js-subscription-json');
        //const subscriptionDetails = document.querySelector('.js-subscription-details');

        if (subscription) {
          // sync the subscription with the server    
          axios.post(this.server + '/api/v1/subscriptions/sync', {
            subscription: subscription,
            segments: that.options.segments || ""
          })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
            
            
            // subscriptionJson.textContent = JSON.stringify(subscription);
            // subscriptionDetails.classList.remove('is-invisible');
        } else {
            // subscriptionDetails.classList.add('is-invisible');
        }
    }
    

    /*
        Show a new notification
    */
    showNotification() {
        // this is only used for demo purposes
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
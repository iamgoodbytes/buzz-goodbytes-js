import axios from 'axios/dist/axios';

export class Buzz
{
    constructor(p_options) {
        
        this.isSubscribed = false;
        this.swRegistration = null;
        this.applicationServerPublicKey = 'BG79+VKll7YW6EQLB1V1Yq2qW134m4Dya1ST5TFgeMARbiueUcZ4qU7lnoElfoKSaJ4h8BdfKnnQXY09gBMwnEA=';
        
        this.options = p_options;

        // show a push button or not
        this.options.button = p_options.button || {}; 
        this.options.button.enable = p_options.button.enable || false;
        this.options.button.target = p_options.button.target || null;
        this.options.button.textSubscribe = p_options.button.textSubscribe || "Not Receiving Notifications";
        this.options.button.textUnsubscribe = p_options.button.textUnsubscribe || "Receiving Notifications";
        this.options.button.textBlocked = p_options.button.textBlocked || "Notifications are blocked";

        // ask to subscribe to notifications automatically by default
        this.options.autoSubscribe = p_options.autoSubscribe == false ? false : true;
        
        // debug settings 
        this.options.debug = p_options.debug || false;
        
        // set authorization options
        this.options.API_KEY = p_options.API_KEY || "";
        this.options.domainId = p_options.domainId || "";
                
        // load all necessary setup stuff
        this.setup();
    }
    
    setServer(){
        // only used during development to change the test server
        if(this.options.development){
            // only used in active development
            this.server = "https://beta.buzzapp.rocks";
            this.applicationServerPublicKey = "BJr2asjIiAkVgFl0UsiHrA4Gb02JgW9VO/l9zL3eRcX100VPntlacLvpV7ZGNVnbKdjeRu5kS8axzTIM63Ux6zc=";
            console.log("Development server set to https://beta.buzzapp.rocks.");
        }
        else
        {
            this.server = "https://buzzapp.rocks";
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

    setRequestHeaders(API_KEY, domainId) {
        if( this.options.debug ) {
            console.log("Setting domain ID to " + domainId);
        }        
        axios.defaults.headers.common = {
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization' : 'Bearer ' + API_KEY,
            'DomainId': domainId
        };
    }
    

    setup(){
        if( this.options.debug ) {
            console.info("We are initiating setup with the following options: ");
            console.info(this.options);
        }
        
        this.setRequestHeaders(this.options.API_KEY, this.options.domainId);
        this.setServer();

        var that = this; // otherwise we will lose our local class scope
        
        if ('serviceWorker' in navigator && 'PushManager' in window) {
        
            if( that.options.debug ) {
                console.log('Service Worker and Push is supported');
            }
                
            navigator.serviceWorker.register('/buzz_sw.js')
                .then(function(swReg) {
                
                    if( that.options.debug ) {
                        console.log('Service Worker is registered', swReg);
                    }
                        
                    that.swRegistration = swReg;
                    
                    // only create a button when needed
                    if( that.options.button.enable ){
                        that.createButton();
                    }
            
                    // only trigger autosubscribing when needed (when autosubscribe is set or when we need to check a previous subscription e.g. set by a previous button action)
                    if( that.options.autoSubscribe || Notification.permission != 'default' ){
                        that.initialiseUI();
                    }    
                })
                .catch(function(error) {
                    if( that.options.debug ) {
                        console.error('Service Worker Error', error);
                    }
                });
        } else {
            if( that.options.debug ) {
                console.warn('Push messaging is not supported');    
            }       
            
            if( that.options.button.enable ){
                that.pushButton.textContent = 'Push Not Supported';
            }            
        }
    }
    
    createButton(){
        if(this.options.debug == true){
            console.info("Creating a button for you.");
            
            if( document.querySelector(this.options.button.target) == undefined){
                if( this.options.debug ) {
                    console.warn("We can't add a button if you don't set a 'target' element for it. Are you sure the target element was set and exists in your HTML?");
                }
            }
        }

        var that = this;

        // create a push button in the target element specified and return that instance
        let button = document.createElement("a");
        let spanIcon = document.createElement("span");
        spanIcon.setAttribute("id", "buzzGoodBytesJsButtonIcon");

        let spanText = document.createElement("span");
        spanText.setAttribute("id", "buzzGoodBytesJsButtonText");

        button.appendChild(spanIcon);
        button.appendChild(spanText);

        button.setAttribute("id", "buzzGoodBytesJsButton");
        // inject the stylesheet for this bad boy
        var link = document.createElement("link");
        if(this.options.testCss == true) {
            console.info("Test CSS is loading");
            link.href = "css/Buzz.css";    
        }
        else {
            link.href = "https://buzzapp.rocks/sdks/Buzz.css";
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

        this.updateBtn();
        
    }

    initialiseUI() {
        
        if( this.options.debug ) {
            console.info("Initialising notification grabbing.");
        }
        
        // store local this scope in that
        var that = this;
        
        // Set the initial subscription value
        this.swRegistration.pushManager.getSubscription()
                .then(function(subscription) {
                    that.isSubscribed = !(subscription === null);

                    that.updateSubscriptionOnServer(subscription);

                    if (that.isSubscribed) {
                        if( that.options.debug ) {
                            console.log('User IS subscribed.');
                        }                        
                    } else {
                        if( that.options.debug ) {
                            console.log('User is NOT subscribed.');
                        }
                        
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
                    if( that.options.debug ) {
                        console.log('Error unsubscribing', error);
                    }
                })
                .then(function() {
                    that.updateSubscriptionOnServer(null);
            
                    if( that.options.debug ) {
                        console.log('User is unsubscribed.');
                    }
                    
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
            
                    if( that.options.debug ) {
                        console.log('User is subscribed:', subscription);
                    }
                        
                    that.updateSubscriptionOnServer(subscription);

                    that.isSubscribed = true;

                    that.updateBtn();
                })
                .catch(function(err) {
                    if( that.options.debug ) {
                        console.log('Failed to subscribe the user: ', err);
                    }
                    
                    that.updateBtn();
                });
    }

    updateBtn() {
        
        // only update the button when we have one
        if( this.options.button.enable ) {
            
            if (Notification.permission === 'denied') {
                this.pushButtonText.textContent = this.options.button.textBlocked;
                this.pushButton.setAttribute("class", "buzzGoodBytesJsButtonBlocked");
                this.updateSubscriptionOnServer(null);
                return;
            }

            if (this.isSubscribed) {
                this.pushButtonText.textContent = this.options.button.textUnsubscribe;
                this.pushButton.setAttribute("class", "buzzGoodBytesJsButtonSubscribed");
            } else {
                this.pushButtonText.textContent = this.options.button.textSubscribe;
                this.pushButton.setAttribute("class", "buzzGoodBytesJsButtonUnsubscribed");
            }
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
            segments: that.options.segments || "",
            domainId: that.options.domainId
          })
          .then(function (response) {
            if( that.options.debug ) {
                console.log("We've synced this user with the app.")   
            }
          })
          .catch(function (error) {
              if( that.options.debug ) {
                  console.log(error);
              }
          });
            

        } 
    }
    

}
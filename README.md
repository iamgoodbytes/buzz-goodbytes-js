After linking the SDK `<script src="https://buzzapp.rocks/sdks/SDK-latest.js"></script>` you can start receiving opt-ins
to your push notification campaigns. Available options to customize the opt-in process are listed below.

```
var buzz = new GoodBytes.Buzz({

         // domainId [string]: can be found in your BuzzApp dashboard by clicking on one of your domains
        'domainId': "a3d27aa4Dx2e8614b82eb6278329f4b3b81ec26fd",    
        
        // autoSubscribe [boolean]: when true, users see a permissions popup in their browser right away
        'autoSubscribe': false,   
        
        // button: using a button makes it easy for your users to opt-in and op-out of push notifications        
        'button': {
            'enable': true,                                   // true/false to enable or disabled
            'target': ".buttonGoesHere",                      // the element where the button will be placed
            'textSubscribe': "Not Receiving Notifications",   // button text shown when users are not subscribed
            'textUnsubscribe': "Receiving Notifications",     // button text shown when users are subscribed
            'textBlocked': "Notifications are blocked",       // button text shown when the user has disabled notifications
        },
        
        // segments [string]: a comma-separated list of segments to subscribe a user to, allows for very specific campaigns
        'segments': "all, promo, other",
        
        // uid [string]: this can be any user identifier you'd like that allows you to target a specific user of your own app 
        'uid': "",
        
        // debug [boolean]: when set to true, we'll show you debug information in your console
        'debug': true
});
```

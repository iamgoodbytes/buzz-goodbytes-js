import Push from 'push.js';

export class _Loop
{
    notification() {
        
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
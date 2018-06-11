const obs = new OBSWebSocket();

let timer = null;
let data = null;

$(document).ready(function () {
    $('.connectionForm').submit((event) => {
        event.preventDefault();

        $('header').hide('faster', connect);
    });
});

function connect() {
    let form = $('.connectionForm').serializeArray();

    $('.container .row .column').html(
        `
            <p style="text-align:center">Connecting to server...</p>
        `
    );

    obs.connect({
        address: form[0].value + ':' + (form[1].value ? form[1].value : '4444'),
        password: (form[2].value ? form[2].value : '')
    })
        .then(() => {
            return obs.getSceneList();
        })
        .then(data => {
            $('.container .row').load('./section.html', function() {
                data.scenes.forEach(scene => {
                    $('.configurationForm select').append(`<option value=${scene.name}>${scene.name}</option>`);
                });

                updateInfoColumn();

                $('.configurationForm').submit((event) => {
                    event.preventDefault();

                    updateInfoColumn();
                })
            });
        })
        .catch(err => {
            console.log(err);
        });

}

function checkTimer() {
    if(data.time === moment().format('hh:mm')) {
        obs.setCurrentScene({'scene-name': data.toScene});

        $('.info .box').prepend('<p style="color: red" id="message">Scene changed to ' + data.toScene + '!</p>');

        setTimeout(() => {
            $('.info .box #message').fadeOut('slow', function() {
                $(this).remove();
            });
        }, 2000);

        clearInterval(timer);
    }
}

function updateInfoColumn() {
    let formData = $('.configurationForm').serializeArray();

    data = {
        toScene: formData[0].value,
        time: formData[1].value
    };
    
    $('.info').html(`
        <div class="box">
            <p>To scene:<br/><b>${data.toScene}</b></p>
            <p>At time:<br/><b>${data.time}</b></p>
        </div>
    `)

    if(timer)
        clearInterval(timer);

    timer = setInterval(checkTimer, 1000);
}
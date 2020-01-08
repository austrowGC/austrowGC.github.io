$(document).ready(function() {

    $.ajax({
        url: 'http://www.pathofexile.com/api/public-stash-tabs',
        type: 'GET',
        dataType: 'jsonp'
    }).done(function(tabs) {
        console.log("next_change_id", tabs.next_change_id);
    });

});

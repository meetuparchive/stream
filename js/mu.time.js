var mu = mu || {};

mu.Time = {
    ago: function(millis) {
        var duration = new Date() - millis;
        if (duration < 1000)
            return "Just now"
        return this.millisToWords(duration) + ' ago';
    },
    millisToWords: function(millis) {
        var print = function(value, name) {
            var whole = Math.floor(value);
            return '' + whole + ' ' + name + ((whole > 1) ? 's' : '');
        };
        var seconds = millis / 1000;
        if (seconds < 60)
            return print(seconds, 'second');
        var minutes = seconds / 60;
        if (minutes < 60)
            return print(minutes, 'minute');
        var hours = minutes / 60;
        if (hours < 24)
            return print(hours, 'hour');
        var days = hours / 24;
        return print(days, 'day');
    }
}
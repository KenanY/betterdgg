;(function(bdgg) {
    bdgg.emoticons = (function() {
        var override, emoteTabPriority;

        var EMOTICONS = [ "ASLAN", "CallChad", "DJAslan", "FIDGETLOL",
            "CallCatz", "DESBRO", "Dravewin", "TooSpicy",
            "BrainSlug", "DansGame", "Kreygasm", "PJSalt", "PogChamp",
            "ResidentSleeper", "WinWaker", "ChanChamp",
            "OpieOP", "4Head", "DatSheffy", "GabeN", "SuccesS",
            "TopCake", "DSPstiny", "SephURR", "Keepo", "POTATO", "ShibeZ",
            "lirikThump", "SpookerZ", "Riperino"
        ];

        var NEW = [ "NiceMeMe", "YEE", "BabyRage", "dayJoy", "kaceyFace",
            "aaaChamp", "CheekerZ" ].sort();

        var OVERRIDES = [ "SoSad" ].sort();

        var RIP = [ "DankMeMe", "RipPA" ].sort();

        var xmasEND = moment('2014-12-29 05:00');
        var xmasOn = moment().isBefore(xmasEND);

        var bdggSortResults = function(fnSortResults) {
            return function(a, b) {
                if (emoteTabPriority) {
                    if (a.isemote != b.isemote) {
                        return a.isemote ? -1 : 1;
                    }
                }

                return fnSortResults.apply(this, arguments);
            };
        };

        return {
            all: [],
            init: function() {
                var emoticons = EMOTICONS.concat(NEW)
                    .filter(function(e) { return destiny.chat.gui.emoticons.indexOf(e) == -1 })
                    .sort();
                destiny.chat.gui.emoticons = destiny.chat.gui.emoticons.concat(emoticons).sort();
                $.each(emoticons, function(i, v) { destiny.chat.gui.autoCompletePlugin.addEmote(v) });
                bdgg.emoticons.all = emoticons;

                var bdggemoteregex = new RegExp('\\b('+emoticons.join('|')+')\\b', 'gm');
                var bdggemotereplacement = '<div title="$1" class="chat-emote bdgg-chat-emote-$1"></div>';
                if (xmasOn) {
                    bdggemotereplacement = '<div title="$1" class="chat-emote bdgg-chat-emote-$1 bdgg-xmas"></div>';
                }

                var BDGGEmoteFormatter = {
                    format: function(str, user) {
                        // use jQuery to parse str as html and only replace in text nodes
                        var wrapped = $('<span>').append(str);
                        wrapped.find('span').addBack().contents().filter(function() { return this.nodeType == 3})
                            .replaceWith(function() {
                                return this.data
                                    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
                                    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                                    .replace(bdggemoteregex, bdggemotereplacement);
                            });

                        if (override) {
                            wrapped.find('.chat-emote').addClass('bdgg-chat-emote-override');
                        }

                        return wrapped.html();
                    }
                };

                destiny.chat.gui.formatters.push(BDGGEmoteFormatter);

                // multi-emote
                $.each(destiny.chat.gui.formatters, function(i, f) {
                    if (f && f.hasOwnProperty('emoteregex') && f.hasOwnProperty('gemoteregex')) {
                        f.emoteregex = f.gemoteregex;
                        return false;
                    }
                });

                bdgg.emoticons.giveTabPriority(bdgg.settings.get('bdgg_emote_tab_priority'));
                bdgg.emoticons.overrideEmotes(bdgg.settings.get('bdgg_emote_override'));
                bdgg.settings.addObserver(function(key, value) {
                    if (key == 'bdgg_emote_tab_priority') {
                        bdgg.emoticons.giveTabPriority(value);
                    } else if (key == 'bdgg_emote_override') {
                        bdgg.emoticons.overrideEmotes(value);
                    }
                });

                // hook into emotes command
                var fnHandleCommand = destiny.chat.handleCommand;
                destiny.chat.handleCommand = function(str) {
                    fnHandleCommand.apply(this, arguments);
                    if (/^emotes ?/.test(str)) {
                        this.gui.push(new ChatInfoMessage("Better Destiny.gg: "+ emoticons.join(", ")));
                        this.gui.push(new ChatInfoMessage("NEW: "+ NEW.sort().join(", ")));
                        this.gui.push(new ChatInfoMessage("RIP: "+ RIP.sort().join(", ")));
                        if (override) {
                            this.gui.push(new ChatInfoMessage("Overrides: "+ OVERRIDES.join(", ")));
                        }
                    }
                };

                var fnSortResults = destiny.chat.gui.autoCompletePlugin.sortResults;
                destiny.chat.gui.autoCompletePlugin.sortResults = bdggSortResults(fnSortResults);
            },
            giveTabPriority: function(value) {
                emoteTabPriority = value;
            },
            overrideEmotes: function(value) {
                override = value;
            }
        }
    })();
}(window.BetterDGG = window.BetterDGG || {}));

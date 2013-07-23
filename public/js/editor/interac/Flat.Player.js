// Generated by CoffeeScript 1.4.0
(function() {
  var __slice = [].slice;

  Flat.Player = (function() {
    var Fraction, L, RESOLUTION, drawDot, noteValues;

    Player.DEBUG = false;

    L = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return typeof console !== "undefined" && console !== null ? console.log.apply(console, ["(Flat.Player)"].concat(__slice.call(args))) : void 0;
    };

    Fraction = Vex.Flow.Fraction;

    RESOLUTION = Vex.Flow.RESOLUTION;

    noteValues = Vex.Flow.Music.noteValues;

    drawDot = Vex.drawDot;

    function Player(parts, options) {
      this.parts = parts;
      L("Initializing player.");
      this.options = {
        instruments: ["acoustic_grand_piano", "electric_bass_pick"],
        tempo: 40
      };
      if (options != null) {
        _.extend(this.options, options);
      }
      this.interval_id = null;
      this.loaded = false;
      this.reset();
    }

    Player.prototype.reset = function() {
      this.tick_notes = {};
      this.all_ticks = [];
      this.next_index = [];
      this.current_ticks = [];
      this.next_event_tick = [];
      this.tpm = this.options.tempo * RESOLUTION;
      this.refresh_rate = 25;
      this.ticks_per_refresh = this.tpm / (60 * (1000 / this.refresh_rate));
      this.total_ticks = 0;
      this.done = false;
      this.context = null;
      return this.stop();
    };

    Player.prototype.render = function() {
      var abs_tick, key, max_voice_tick, note, total_ticks, total_voice_ticks, voice, _i, _len, _ref;
      var _i2,_i3;
      var _len2, _len3;
      var part;
      var measure;
        
      for (_i3 = 0, _len3 = this.parts.length; _i3 < _len3; _i3++) {
        total_ticks = new Fraction(0, 1);
        max_voice_tick = new Fraction(0, 1);
        total_voice_ticks = new Fraction(0, 1);
        this.tick_notes = {};
        this.next_index[_i3] = 0;
        this.current_ticks[_i3] = 0;
        this.next_event_tick[_i3] = 0;
        part = this.parts[_i3];
        for (_i2 = 0, _len2 = part.measure.length; _i2 < _len2; _i2++) {
          measure = part.measure[_i2];
          voice = measure['$fermata'].vexVoices[0];
          _ref = voice.getTickables();
          L("Starting table parsing", _ref);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            note = _ref[_i];
            if (!note.shouldIgnoreTicks()) {
              abs_tick = total_ticks.clone();
              abs_tick.add(total_voice_ticks);
              key = abs_tick.toString();
              if (_.has(this.tick_notes, key)) {
                this.tick_notes[key].notes.push(note);
              } else {
                this.tick_notes[key] = {
                  tick: abs_tick.clone(),
                  value: abs_tick.value(),
                  notes: [note]
                };
              }
              total_voice_ticks.add(note.getTicks());
            }
          }
        }
        if (total_voice_ticks.value() > max_voice_tick.value()) {
          max_voice_tick.copy(total_voice_ticks);
        }
        total_ticks.add(max_voice_tick);
        this.all_ticks[_i3] = _.values(this.tick_notes);
        this.total_ticks = _.last(this.all_ticks[_i3]);
        _.sortBy(this.all_ticks[_i3], function(tick) {
          return tick.value;
        });
      }
      return L(this.all_ticks);
    };

    Player.prototype.playNote = function(notes, channel) {
      var key, keys, midi_note, note, octave, x, y, _i, _len, _results;
      L("(" + this.current_ticks + ") Play: ", notes);
      _results = [];
      for (_i = 0, _len = notes.length; _i < _len; _i++) {
        note = notes[_i];
        keys = note.keys;
        x = note.getAbsoluteX();
        y = note.getStave().getYForLine(0) - 5;
        L("X:", x, "Y:", y);
        _results.push((function() {
          var _j, _len1, _ref, _results1;
          _results1 = [];
          for (_j = 0, _len1 = keys.length; _j < _len1; _j++) {
            key = keys[_j];
            _ref = key.split("/"), note = _ref[0], octave = _ref[1];
            note.toLowerCase();
            midi_note = (21 + (octave * 12)) + noteValues[note].int_val;
            MIDI.noteOn(channel, midi_note, 127, 0);
            if (this.context != null) {
              _results1.push(drawDot(this.context, x, y, "red"));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Player.prototype.refresh = function(end_callback) {
      if (this.done) {
        this.stop();
        end_callback();
        return; 
      }
      var _i, _len;
      var finish_flag = true;
      
      for (_i = 0, _len = this.all_ticks.length; _i < _len; _i++) {
        this.current_ticks[_i] += this.ticks_per_refresh;
        if (this.next_event_tick[_i] != -1 && this.current_ticks[_i] >= this.next_event_tick[_i]) {
          this.playNote(this.all_ticks[_i][this.next_index[_i]].notes, _i);
          this.next_index[_i]++;
        }
        if (this.next_index[_i] >= this.all_ticks[_i].length) {
          this.next_event_tick[_i] = -1;
        } else {
          finish_flag = false;
          this.next_event_tick[_i] = this.all_ticks[_i][this.next_index[_i]].tick.value();
        }
      }
      if (finish_flag === true)
        this.done = true;
    };

    Player.prototype.stop = function() {
      L("Stop");
      if (this.interval_id != null) {
        window.clearInterval(this.interval_id);
      }
      return this.interval_id = null;
    };

    Player.prototype.start = function(end_callback) {
      var _this = this;
      this.stop();
      L("Start");
      this.interval_id = window.setInterval((function() {
        return _this.refresh(end_callback);
      }), this.refresh_rate);
      return L("Started");
    };

    Player.prototype.play = function(end_callback) {
      if (typeof(end_callback) === 'undefined' || end_callback === null)
        end_callback = function(){};
      var _this = this;
      L("Play: ", this.refresh_rate, this.ticks_per_refresh);
      if (this.loaded) {
        return this.start();
      } else {
        return MIDI.loadPlugin({
          soundfontUrl: "http://static1.ovhcloudcdn.com/V1/AUTH_d672aaa5e925e3cff7969c71e75e3349/flat-soundfront/",
          instruments: this.options.instruments,
          limitedNetwork: true,
          callback: function() {
            MIDI.programChange(0, 0);
            MIDI.programChange(1, 34);
            _this.loaded = true;
            return _this.start(end_callback);
          }
        });
      }
    };

    return Player;

  })();

}).call(this);
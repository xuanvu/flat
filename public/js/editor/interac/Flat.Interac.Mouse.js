(function() {
	"use strict";

	Flat.Interac.prototype.MouseInteracInit = function() {
		if (this.data === undefined) {
			console.log("Error, parts undefined in mouse interac")
		}

		var parts = this.data['score']['score-partwise']['part'];
		for (var i = 0; i < parts.length; i++)
			for (var j = 0; j < parts[i]['measure'].length; j++)
				for (var k = 0; k < parts[i]['measure'][j]['$fermata']['vexVoices'].length; k++)
					for (var l = 0; l < parts[i]['measure'][j]['$fermata']['vexVoices'][k]['tickables'].length; l++) {
						this.MouseUpdateTick(parts[i]['measure'][j]['$fermata']['vexVoices'][k]['tickables'][l], this);
          }
	};

	Flat.Interac.prototype.MouseClic = function(pos_x, pos_y) {
    console.log(pos_x, pos_y);
    var posTick = this.is_onTick(pos_x, pos_y);
    if (posTick !== null && posTick.nbTick !== null) {
      this.Cursor.setFocus(posTick);
    }
    if (posTick !== null && this.ActionFocus != null) {
      this.getTickPos(pos_x, posTick);
      console.log(posTick);
      var line = this.getLine(pos_y, posTick);
      posTick.nbVoice += 1;
      posTick.nbTick = (posTick.nbTick > 0) ? posTick.nbTick -1 : 0 
      this.ActionFocus(this.data, posTick, line);
      return posTick;
    }
    return undefined;
	};

	Flat.Interac.prototype.getLine = function(pos_y, posTick) {
    var parts = this.data['score']['score-partwise']['part'];
    var i = -1
    while (i < 8) {
      if (parts[posTick.nbPart]['measure'][0]['$fermata']['vexStaves'][posTick.nbVoice].getYForLine(i) > pos_y) {
        break;
      }
      i += 0.5;
    }
    return convertLine(i + 0.5)
    function convertLine(line) {
        return (6.0 - line);
    };
	};

  Flat.Interac.prototype.getTickPos = function(pos_x, posTick) {
    var voice = this.data['score']['score-partwise']['part'][posTick.nbPart]['measure'][posTick.nbMeasure]['$fermata']['vexVoices'][posTick.nbVoice]['tickables'];
    var i = 0;
    while (i < voice.length) {
      if (voice[i].getAbsoluteX() >= pos_x) {
        posTick.nbTick = i;
        break;
      }
      i++;
    }
    if (!posTick.nbTick) {
      posTick.nbTick = voice.length;  
    }
    
  };

  Flat.Interac.prototype.findNote = function (pos_x, pos_y, posTick) {
    console.log("try", pos_x, pos_y);
    var parts = this.data['score']['score-partwise']['part'];
    for (var i = 0; i < parts.length; i++) {
      for (var j = 0; j < parts[i]['measure'].length; j++) {
        for (var k = 0; k < parts[i]['measure'][j]['$fermata']['vexVoices'].length; k++) {
          for (var l = 0; l < parts[i]['measure'][j]['$fermata']['vexVoices'][k]['tickables'].length; l++) {
            console.log(parts[i]['measure'][j]['$fermata']['vexVoices'][k]['tickables'][l].st.getBBox());
            if (Raphael.isPointInsideBBox(parts[i]['measure'][j]['$fermata']['vexVoices'][k]['tickables'][l].st.getBBox(), pos_x, pos_y) === true) {
              posTick.nbPart = i;
              posTick.nbMeasure = j;
              posTick.nbVoice = k;
              posTick.nbTick = l;
              return ;
            }
          }
        }
      }
    }
  }

  Flat.Interac.prototype.is_onTick = function(pos_x, pos_y) {
    var parts = this.data['score']['score-partwise']['part'];
    var res = this.getGoodStave(pos_x, pos_y);
    if (res === null) {
      return res;
    }
    
    for (var l = 0; l < parts[res.nbPart]['measure'].length; l++)
      for (var m = 0; m < parts[res.nbPart]['measure'][l]['$fermata']['vexVoices'][res.nbVoice]['tickables'].length; m++) {
        if (Raphael.isPointInsideBBox(parts[res.nbPart]['measure'][l]['$fermata']['vexVoices'][res.nbVoice]['tickables'][m].st.getBBox(),
          pos_x, pos_y)=== true) {
          res.nbTick = m
          res.nbMeasure = l;
          return res;
        }
      }
    return res;
  };

  Flat.Interac.prototype.getGoodStave = function(pos_x, pos_y) {
    var fStave = {
      nbPart : 0,
      nbVoice : 0,
      nbTick : null,
      nbMeasure : 0
    };
    var parts = this.data['score']['score-partwise']['part'];
    for (var i = 0; i < parts.length; i++)
      for (var k = 0; k < parts[i]['measure'][0]['$fermata']['vexStaves'].length; k++) {
        if (parts[i]['measure'][0]['$fermata']['vexStaves'][k].getYForLine(-6) < pos_y &&
          parts[i]['measure'][0]['$fermata']['vexStaves'][k].getYForLine(7) > pos_y) {
          fStave.nbPart = i;
          fStave.nbVoice = k;
          for (var j = 0; j < parts[i]['measure'].length; j++) {
            if (pos_x > parts[i]['measure'][j]['$fermata']['vexStaves'][k].getTieStartX() &&
              pos_x <parts[i]['measure'][j]['$fermata']['vexStaves'][k].getTieEndX()) {
              fStave.nbMeasure = j;
            }
          }
          return fStave;
        }
      }
    return null;  
  };

	Flat.Interac.prototype.MouseUpdateTick = function(tick, this_) {
		//FLAT: Here is the big part which bring interactivity
    var that = tick;
    var _this = this_;
    var ctx = that.context;
    var ligne = that.keyProps[0].line;
    var posTick = {
      nbPart : 0,
      nbVoice : 0,
      nbTick : null,
      nbMeasure : 0
    };

    function stroke(y) {
        if (that.default_head_x != null)
          that.head_x = that.default_head_x;
        return ctx.fillRect(that.head_x - that.render_options.stroke_px, y,
                            ((that.head_x + that.glyph.head_width) - that.head_x) +
                            (that.render_options.stroke_px * 2), 1,
                            false, true);
    }

    function changeStaveNotePitch(offset) {
      var orig_lowest_line = that.lowest_line;
      var orig_highest_line = that.highest_line;
      for (var i in that.keyProps)
      {
        var note_props = that.keyProps[i];
        note_props.line += offset;
        // If we move up the note
        if (offset > 0)
        {
          if (note_props.line > that.highest_line)
          {
            that.highest_line = Math.floor(note_props.line);
            if (that.highest_line - note_props.line === 0)
            {
              var ledger_line = stroke(that.stave.getYForNote(that.highest_line));
              that.ledger_lines.push({"line": that.highest_line, "obj": ledger_line});
            }
          }
          else if (that.lowest_line < 1 && (note_props.line - offset) <= orig_lowest_line && note_props.line > orig_lowest_line)
          {
            that.lowest_line = Math.ceil(note_props.line);
            var first_line = that.ledger_lines[0];
            while (first_line && first_line.line < that.lowest_line)
            {
              var ledger_line = that.ledger_lines.shift();
              ledger_line["obj"].remove();
              first_line = that.ledger_lines[0];
            }
          }
          //console.log(note_props);
        }
        // Else if we move down the note
        else
        {
          if (note_props.line < that.lowest_line && note_props.line <= 0)
          {
            // Create new line and update the lowest_line
            that.lowest_line = Math.ceil(note_props.line);
            if (that.lowest_line - note_props.line === 0)
            {
              var ledger_line = stroke(that.stave.getYForNote(that.lowest_line));
              that.ledger_lines.unshift({"line": that.lowest_line, "obj": ledger_line});
            }
          }
          else if (that.highest_line > 5 && (note_props.line - offset) >= orig_highest_line && note_props.line < orig_highest_line)
          {
            // Update highest_line
            that.highest_line = Math.floor(note_props.line);
            // Remove useless highest_line from ledger_lines[] and from staff
            var first_line = that.ledger_lines[that.ledger_lines.length - 1];
            while (first_line && first_line.line > that.highest_line)
            {
              var ledger_line = that.ledger_lines.pop();
              ledger_line["obj"].remove();
              first_line = that.ledger_lines[that.ledger_lines.length - 1];
            }
          }
        }
      }
      for (var j = 0; j < that.ledger_lines.length - 1; j++)
      {
        var missing_line = that.ledger_lines[j].line + 1;
        if (that.ledger_lines[j])
        if ((missing_line < that.ledger_lines[j + 1].line && (missing_line < 1 || missing_line > 5)))
        {
          var ledger_line = stroke(that.stave.getYForNote(missing_line));
          that.ledger_lines.splice(j + 1, 0, {"line": missing_line, "obj": ledger_line});
          console.log("Add missing line > ", missing_line);
        }
        else if (j === that.ledger_lines.length - 2 && missing_line < 0)
        {
          var ledger_line = stroke(that.stave.getYForNote(0));
          that.ledger_lines.splice(j + 2, 0, {"line": 0, "obj": ledger_line});
        }
      }
    }
    
    that.st.mouseover(function(){
        that.st.attr({fill: 'green', 'stroke-width': '2.5'});
      }).
      mouseout(function(){
        that.st.attr({fill: 'black', 'stroke-width': '0'});
        that.st.forEach(function(e) {
                if (e.type == "rect")
                  e.attr(ctx.attributes);
              });
      }).
      drag(function (dx, dy) {
          var step_y = 5;
          var trans_x = 0;
          var y_offset = ((dy >= 0) ? Math.floor(dy / step_y) : Math.ceil(dy / step_y));
          var scaled_y_offset = y_offset / 2;
          var trans_y = (y_offset * step_y) - that.st.oy;
          
          if (that.st.last_y_offset !== scaled_y_offset)
          {
            var offset = that.st.last_y_offset - scaled_y_offset;
            that.st.last_y_offset = scaled_y_offset;
            changeStaveNotePitch(offset);
          }
          that.st.transform("...t" + trans_x + "," + trans_y);
          that.st.ox = dx;
          that.st.oy += trans_y;
        }, 
        function (x, y, event) {
          _this.findNote(event.offsetX, event.offsetY, posTick);
          that.st.ox = 0;
          that.st.oy = 0;
          that.st.last_y_offset = 0;
        },
        function() {
          for (var j = 0; j < that.ledger_lines.length - 1; j++)
          {
            var missing_line = that.ledger_lines[j].line + 1;
            if (missing_line < that.ledger_lines[j + 1].line && (missing_line < 1 || missing_line > 5))
            {
              var ledger_line = stroke(that.stave.getYForNote(missing_line));
              that.ledger_lines.splice(j + 1, 0, {"line": missing_line, "obj": ledger_line});
              console.log("Add missing line > ", missing_line);
            }
          }
          if (that.st.last_y_offset) {
            try {
              var move = (that.keyProps[0].line - ligne) * 2.0;
              _this.data.changeNotePitch(posTick.nbPart, posTick.nbMeasure, posTick.nbTick, move);
            }
            catch (err) {
              console.log(err);
            }
            for (var i = 0; i < that.ledger_lines.length; i++)
            {
              var ledger_line = that.ledger_lines[i];
              ledger_line["obj"].remove();
            }
            _this.render.renderOneMeasure(posTick.nbMeasure, posTick.nbPart, true);
            _this.drawer.drawAll();
            _this.MouseInteracInit();
          }
          this_.Socket.emit('position', {partId: posTick.nbPart, measureId: posTick.nbMeasure, measurePos: posTick.nbTick});
        }
      );
  //FLAT: End of interactivity part
	};

}).call(this);
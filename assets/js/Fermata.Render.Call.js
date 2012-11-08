/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var Fermata = Fermata || {};

if (typeof(Fermata.Render) === "undefined")
{
  throw ("Fermata.Render.js MUST be included before Fermata.Render.Note.js");
}

(function () {
  "use strict";
  
    Fermata.Render.prototype.FuncTypes =
  {
    STAR: "*",
    PLUS: "+",
    QUESTION: "?",
    DEFAULT: "default"
  };

  /**
   * object is the node of interest
   * processes is an array of objects:
   * {type, key, func}
   * type is the number of apparitions of the object
   * key is the key of the child element.
   * func is the function to apply to the child elements
   */
  Fermata.Render.prototype.exploreSubNodes = function (object, processes)
  {
    for (var i = 0 ; i < processes.length ; i++)
    {
      var process = processes[i];

      if (process.type === this.FuncTypes.STAR)
      {
        this.call_0orN(object, process);
      }
      else if (process.type === this.FuncTypes.QUESTION)
      {
        this.call_0or1(object, process);
      }
      else if (process.type === this.FuncTypes.PLUS)
      {
        this.call_1orN(object, process);
      }
      else if (process.type === this.FuncTypes.DEFAULT)
      {
        this.call_1(object, process);
      }
    }
  }

  Fermata.Render.prototype.call_1 = function (object, process)
  {
    var child = object[process.key];

    process.func(child);
  }

  Fermata.Render.prototype.call_1orN = function (object, process)
  {
    var child = object[process.key];

    for (var j = 0 ; j < child.length ; j++)
    {
      var elem = child[j];

      process.func(elem);
    }
  }


  Fermata.Render.prototype.call_0or1 = function (object, process)
  {
    if (typeof(object[process.key]) !== "undefined")
    {
      var child = object[process.key];

      process.func(child);
    }
  }

  Fermata.Render.prototype.call_0orN = function (object, process)
  {
    if (typeof(object[process.key]) !== "undefined")
    {
      var child = object[process.key];

      for (var j = 0 ; j < child.length ; j++)
      {
        var elem = child[j];

        process.func(elem);
      }
    }
  }
  
}).call(this);

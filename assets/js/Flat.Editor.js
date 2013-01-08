$(document).ready(function() {
  // Creating toolbars
  // TODO: add actions, store open toolbars in local storage, etc.
  var toolbars = [
    { icon: 'icon-music', sub: [{ icon: 'icon-music' }, { icon: 'icon-music' }] },
    { icon: 'icon-music', sub: [{ icon: 'icon-music' }, { icon: 'icon-music' }, { icon: 'icon-music' }, { icon: 'icon-music' }, { icon: 'icon-music' }, { icon: 'icon-music' }, { icon: 'icon-music' }] },
    { icon: 'icon-music', sub: [{ icon: 'icon-music' }, { icon: 'icon-music' }, { icon: 'icon-music' }, { icon: 'icon-music' }, { icon: 'icon-music' }] },
  ];

  var toolbarsCreate = function() {
    var toolbarMain = $('.toolbar-top .first'),
        toolbarSubs = $('.toolbar-top .second');

    console.log(toolbars.length);
    for (var i = 0 ; i < toolbars.length ; ++i) 
    {
      // main
      var icon = toolbarMain.append('<a href="#"><i class="icon-white"></i></a>').find('a:last');
      icon.attr('tidx', i).find('i').addClass(toolbars[i].icon);
      icon.click(function() {
        var tidx = $(this).attr('tidx');
            sub = toolbarSubs.find('div[tidx="' + tidx + '"]');

        // set toolbar as active
        if (sub.hasClass('inactive')) {
          // update sub
          sub.removeClass('inactive').addClass('active');
          for (var i = 0 ; i < toolbars[tidx].sub.length ; ++i) {
            var icon = sub.append('<a href="#"><i class="icon-white"></i></a>').find('a:last');
            icon.find('i').addClass(toolbars[tidx].sub[i].icon);
          }

          // update main
          $(this).addClass('active').append('<span class="toolbar-close">&times;</span>');
          $(this).css('width', (sub.width() - 19) + 'px');
        }
        // set toolbar as inactive
        else {
          $(this).removeClass('active').css('width', 'auto').find('.toolbar-close').remove();
          sub.removeClass('active').addClass('inactive').empty();
        }

        return false;
      });

      // sub
      toolbarSubs.append('<div class="toolbar inactive"></div>').find('div:last').attr('tidx', i);
    }
  };

  return toolbarsCreate();
});
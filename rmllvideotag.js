$(document).ready(function(){
	$('.conf_from,.conf_to')
	.live('click',function(e){
		var input=$(e.target);
		var sec=time_parse(input.val());
		if (isNaN(sec) || e.shiftKey) {
			input.val(secs_format(jwplayer().getPosition()));
		}
	})
	.live('keypress',function(e){
		if (e.keyCode==13 || e.keyCode==14) { // return and keypad return
			var input=$(e.target);
			var sec=time_parse(input.val());
			if (!isNaN(sec)) {
				jwplayer().seek(sec);
			}
		}
	});

	$('.chunk_save').live('click',function(e){
		$('.chunk_save',$(this).closest('tr').clone(true).appendTo('.chunks table'))
		.removeClass('chunk_save')
		.addClass('chunk_remove')
		.val('-')
		.die('click')
		.bind('click',function(e) {
			$(this).closest('tr').remove();
			return false;
		});
		$('.chunks')[0].scrollTop=9999999999;
		return false;
	});

	$('#save').live('click',function(e){
		var csv=[];
		$('.chunks tr').each(function(i,tr){
			var chunk={};
			chunk.conf_id=$('.conf_id',tr).val();
			chunk.index=$('.conf_chunk',tr).val();
			chunk.from=ffmpeg_timeformat($('.conf_from',tr).val());
			chunk.to=ffmpeg_timeformat($('.conf_to',tr).val());
			csv.push(chunk.conf_id+';'+chunk.index+';'+chunk.from+';'+chunk.to);
		});
		alert(csv.join("\n"));
	});

	function ffmpeg_timeformat(t) {
		var ta=t.split(':');
		ta[0]=parseInt(ta[0],10);
		var h=Math.floor(ta[0]/60);
		var m=ta[0]-h*60;
		var s=ta[1].split('.')[0];
		return twoDigits(h)+':'+twoDigits(m)+':'+s;
	}

	$(window).bind('resize',function(e){
		iframeprog_onresize(e);
		iframevidz_onresize(e);
	});
	$('iframe#prog')
	.bind('load',function(e){
		if (!top.prog) top.prog=iframe('/rmllvideotag/rmllnow.php');
		iframeprog_onresize();
		$('a',top.prog.window.document).bind('click',prog_click)
	})
	.attr('src','/rmllvideotag/rmllnow.php');

	$('iframe#vidz')
	.bind('load',function(e){
		if (!top.vidz) top.vidz=iframe('/rmllvideotag/rmllvidz.php');
		iframevidz_onresize();
		$('a',top.vidz.window.document).bind('click',vidz_click)
	})
	.attr('src','/rmllvideotag/rmllvidz.php');
});

function iframe(pathname) {
	for (i=0; i<window.frames.length; ++i) {
		if (window.frames[i].window.document.location.pathname==pathname)
			return window.frames[i];
	}
}

function iframeprog_onresize() {
	$('iframe#prog').css('height',$(window).height()-$('iframe#prog').offset().top+'px');
}
function iframevidz_onresize() {
	$('iframe#vidz').css('height',$('#vidzRight').height()+'px');
}

function vidz_click(e) {
	var li=$(e.target).closest('li');
	var vid=li.attr('data-vid')
	var url=document.location.pathname.split('?')[0]+'?vid='+vid;
	if (!li.hasClass('ui-btn-active')) {
		$.ajax({
			type: 'GET',
			url: document.location.pathname.split('?')[0],
			data: 'vid='+vid+'&num='+li.attr('data-id'),
			dataType: 'html',
			async: true,
			success: function(html) {
				$('#vid').html(html);
				var ul=li.closest('ul');
				$('.ui-btn-active',ul).removeClass('ui-btn-active');
				ul.find('[data-vid='+vid+']').addClass('ui-btn-active').each(function(i,li){
					console.log(li);
					$('[href="#_'+$(li).attr('data-id')+'"]',top.prog.window.document).closest('li').addClass('ui-btn-active');
				});
				
/*				setTimeout(function(){
					iframevidz_onresize();
					iframeprog_onresize();
				},0);
*/
			}
		});
	}
	else {
	}
}

function twoDigits(a) {
    return (parseFloat(a,10)>9)?a:'0'+a;
}   

function threeDigits(a) {
    return (parseFloat(a,10)>99)?a:'0'+twoDigits(a);
}   

function secs_format(secs) {
	if (isNaN(secs)) return '000:00.00';
	var mins=Math.floor(secs/60);
	var secs=secs-mins*60;
	var ret=threeDigits(mins)+':'+twoDigits(secs);
	var dec=(secs-Math.floor(secs)).toString();
	if (dec.length==1) ret+='.00';
	else if (dec.length==3) ret+='0';
	return ret;
}

function time_parse(t) {
	var sec=0,min=0;
	var time=t.split(':');
	if (!time.length) return NaN;
	sec=parseFloat(time.pop(),10);
	if (sec<0 || isNaN(sec)) return NaN;
	if (time.length) {
		min=parseInt(time.pop(),10);
		if (min<0 || isNaN(min)) return NaN;
		if (time.length) {
			return NaN;
		}
	}
	return sec+min*60;
}


var gal_index = 0;
var name = null;
var pnouns_age = null;
var title1 = null;
var title2 = null;
var title3 = null;
var image1 = null;
var image2 = null;
var image3 = null;
var statement1 = null;
var statement2 = null;
var statement3 = null;
var support_link = null;
var palette_link = null;
var fallback_image = "assets/img/fallback_image.png";
var fallback_statement = "(statement not provided)"


const left_nav = document.getElementById("left_nav");
const right_nav = document.getElementById("right_nav");

$("#left_nav").click(function() {
  console.log("l click" + gal_index.toString());
  gal_index -= 1;
  if (gal_index < 0) {
    gal_index = 0;
  }
  read_current_file();
  populate();
});

$("#right_nav").click(function() {
  console.log("r clicked")
  gal_index += 1;
  if (gal_index > 100) {
    gal_index = 0;
  }
  read_current_file();
  populate();
});

$("#left_preview").click(function() {
  tempImg = image1;
  image1 = image2;
  image2 = tempImg;

  tempState = statement1;
  statement1 = statement2;
  statement2 = tempState;
  populate_page();
});
$("#right_preview").click(function() {
  temp = image1;
  image1 = image3;
  image3 = temp;

  tempState = statement1;
  statement1 = statement3;
  statement3 = tempState;
  populate_page();
});

function populate_page() {
  if (name == null || pnouns_age == null || title1 == null || image1 == null) {
    console.log("error showing page - missing elements");
    if(title1 == null){
      console.log("^ title");
      console.log(title1);
      console.log(title2);
      console.log(title3);
    } else if (image1 == null) {
      console.log("^ image");
    }
  } else {
    $("#name").text(name);
    S("pnouns_name").text(pnouns_name);
    $("#title").text(title1);
    $("#main_image").attr("src", image1);

    if (statement1 != null) {
      $("#artist_statement").text(statement1);
    } else {
      $("#artist_statement").text(fallback_statement);
    }

    if (image2 != null) {
      console.log("trying image 2")
      console.log(image2);
      $("#left_preview").attr("src", image2);
    } else {
      $("#left_preview").attr("src", fallback_image);
    }
    if (image3 != null) {
      console.log(image3);
      $("#right_preview").attr("src", image3);
    } else {
      $("#right_preview").attr("src", fallback_image);
    }

    if (palette_link != null) {
      $("palette_icon").attr("href", palette_link)
    } else {
      $("palette_icon").css("opacity", 0.5);
    }
    if (support_link != null) {
      $("support_icon").attr("href", support_link)
    } else {
      $("support_icon").css("opacity", 0.5);
    }
  }
}

function read_current_file() {
  $.getJSON("assets/js/gal_files/" + gal_index.toString(), function(data) {
    name = data.name;
    pnouns_age = data.pnouns_age;

    title1 = data.title1;
    title2 = data.title2;
    title3 = data.title3;

    image1 = data.image1;
    image2 = data.image2;
    image3 = data.image3;

    statement1 = data.statement1;
    statement2 = data.statement2;
    statement3 = data.statement3;

    palette_link = data.palette_link;
    support_link = data.support_link;
  }).fail(function() {
    console.log("error loading JSON");
  });
}

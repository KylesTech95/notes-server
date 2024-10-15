// let list = document.querySelectorAll('.textarea-list-container>li')
let listContainer = document.querySelector(".textarea-list-container");
let listTop = document.querySelector("#textarea-top");
let textarea = document.querySelector("textarea");
let api = "/notes";
const clearbtn = document.getElementById('clear')
clearbtn.onclick = e => {
textarea.focus();
}

const liHover = (e) => {
  let target = e.currentTarget;
  let bar = target.children[1];
  bar.classList.add("bar-glow");
};
const liOut = (e) => {
  let target = e.currentTarget;
  let bar = target.children[1];
  bar.classList.remove("bar-glow");
};
window.onload = e => {
  // fetch data from `/notes` endpoint (server/routes.js)
// We are retrieving api data from psql
fetch(api)
.then((r) => r.json())
.then((data) => {
  // console.log(data);
  let arr = [...data.data];
  //  console.log(arr)
  // <i class="fa-solid fa-bars"></i>
  arr.forEach((note, index) => {
    const li_btn = document.createElement("button");
    const icon = document.createElement("i");
    li_btn.classList.add("text-area-list-container>li>button");
    const li = document.createElement("li");
    li.setAttribute('id','li'+(index+1))
    li.classList.add("textarea-list-container>li");
    li.classList.add("hide-item");
    icon.classList.add("fa-solid");
    icon.classList.add("fa-bars");
    icon.classList.add("drag-elem");
  //   li.setAttribute('draggable',true)
    li.textContent = note.timestamp + " - " + (index+1) + ": " + note.notes;
    listContainer.appendChild(li);
    li.appendChild(li_btn);
    li.append(icon);
    li.addEventListener("mouseover", liHover);
    li.addEventListener("mouseout", liOut);
    listTop.scrollTo(0,listTop.scrollHeight);

  });
  const items = document.querySelectorAll(".textarea-list-container>li");
  // console.log(items)
  for (let x = 0; x < items.length; x++) {
    if (items[x].classList.contains("hide-item")) {
      items[x].classList.remove("hide-item");
      items[x].classList.add("show-item");
    }
  }

  [...listContainer.children].forEach((el, index) => {
    let btn = el.children[0];
    const dbId = arr[index].id;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (listContainer.children.length <= 1) {
        $.ajax({
          type: "POST",
          url: "/delete",
        });
      } else {
        console.log("you deleted me");
        $.ajax({
          type: "GET",
          url: `/delete/${dbId}`,
        });
      }
      listContainer.removeChild(e.target.parentElement);
    });
  });
});
}
// helper function to format textarea (security)
const formatTextArea = (textarea) => {
  textarea.value = textarea.value.replace(
    /[;\)\(\_\~\+\=\^\%\$\#\@\!\&\*\|\[\])]/g,
    ""
  );
};

const formatUTC = (date) => {
  // form object of months
  const months = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };
  // goal: 2024-03-28T23:45:32.313Z
  // current: Thu, 28 Mar 2024 23:56:55 GMT
  let num;
  const year = date.match(/[0-9]{4}/); //year
  const month = date.split` `[2].toLowerCase(); //month to lowercase
  const day = date.split` `[1]; //day
  const time = date.split` `[4]; //utc-Time
  Object.keys(months).forEach((key) => {
    if (key.slice(0, 3) === month) {
      num = months[key];
    }
  });
  return `${year}-${num < 10 ? "0" + num : num}-${
    day < 10 ? "0" + day : day
  }T${time}Z`;
};
// use ajax to submit form data without page reload
$(".post").on("click", function (e) {
  e.preventDefault();
  textarea.focus();

  // const mod_date = formatUTC(date);
  formatTextArea(textarea);
  let note = textarea.value;
  if (note) {
    // post notes to db
    $.ajax({
      type: "POST",
      url: "/notes",
      data: { notes: note },
      success: function (data) {
        let dArr = [...data.data];
        dArr.forEach((note, index) => {
          if (index == dArr.length - 1) {
            const icon = document.createElement("i");
            const li_btn2 = document.createElement("button");
            li_btn2.classList.add("text-area-list-container>li>button");
            const li2 = document.createElement("li");
            li2.setAttribute('id','li'+index+1)
            li2.classList.add("textarea-list-container>li");
            icon.classList.add("fa-solid");
            icon.classList.add("fa-bars");
            icon.classList.add("drag-elem");
            // li2.setAttribute('draggable',true)
            li2.textContent =
              note.timestamp + " - " + (index+1) + ": " + note.notes;
            listContainer.append(li2);
            li2.appendChild(li_btn2);
            li2.appendChild(icon);
            textarea.value = "";
            li2.addEventListener("mouseover", liHover);
            li2.addEventListener("mouseout", liOut);
            listTop.scrollTo(0,listTop.scrollHeight);
          }
        });
        //btn click for deleting a specific note
        return [...listContainer.children].forEach((el, index) => {
          if (index == [...listContainer.children].length - 1) {
            let numId = el.textContent.match(/^\d+/).join``;
            // console.log(numId);
            let btn = el.children[0];
            let note = textarea.value;
            const dbId2 = dArr[index].id;

            btn.addEventListener("click", (e) => {
              e.preventDefault();

              if (listContainer.children.length <= 1) {
                $.ajax({
                  type: "POST",
                  url: "/delete",
                });
              } else {
                console.log("you deleted me");

                $.ajax({
                  type: "GET",
                  url: `/delete/${dbId2}`,
                });
              }
              listContainer.removeChild(e.target.parentElement);
            });
          }
        });
      },
    });
  } else {
    textarea.value = "";
  }
});

// delete all data
$(".delete").on("click", function (e) {
  e.preventDefault();
  formatTextArea(textarea);
  let note = textarea.value;
  $.ajax({
    type: "POST",
    url: "/delete",
  });
  textarea.value = "";
  textarea.focus();
  // remove children
  return [...listContainer.children].forEach((c) =>
    listContainer.removeChild(c)
  );
});


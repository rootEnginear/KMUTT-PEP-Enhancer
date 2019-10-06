// Get Data
let data_element = document.querySelector("table[border='1']");
let subjects_string = data_element.innerText;
let subjects_link = [...document.querySelectorAll("table[border='1'] a")].map(
  link => link.href
);
// let pagination_string = document
//   .querySelector("table[border='0'] > tbody > tr > td:nth-child(4)")
//   .innerText.trim();
// let pagination_string_matcher = /Records\s*\d+\s*to\s*\d+\s*of\s*(\d+)/g;
// let total_page = +pagination_string_matcher.exec(pagination_string)[1];
// console.log(total_page);

if (total_page) {
  // Transform Data
  let subjects_array = subjects_string
    .split("\n")
    .map((line, index) => [index, line])
    .reduce(
      (all, current) =>
        current[0] % 2
          ? (function(all, content) {
              temp = all;
              last = temp.pop();
              return [...temp, last + content];
            })(all, current[1])
          : all.concat(current[1]),
      []
    );
  let subjects_data = subjects_array.map((subject, index) => {
    let matcher = /\d+\s*รหัสวิขา\s*(.+?)\s*ชื่อวิชา\s*(.+?)\s*Call Number\s*(.+?)\s*ปีการศีกษา\s*(.+?)\s*ภาคเรียน\s*(.+?)\s*ข้อสอบ\s*(.*)/g;
    let matches = matcher.exec(subject);
    return {
      s_id: matches[1].trim(),
      s_name: matches[2].trim(),
      s_cnum: matches[3].trim(),
      s_year: matches[4].trim(),
      s_term: matches[5].trim(),
      s_type: matches[6].trim(),
      s_link: subjects_link[index]
    };
  });

  // Sort data
  subjects_data.sort((a, b) => {
    let a_score =
      +a.s_year +
      a.s_term * 0.1 +
      {
        "Mid-Term": 0,
        Final: 0.01
      }[a.s_type];
    let b_score =
      +b.s_year +
      b.s_term * 0.1 +
      {
        "Mid-Term": 0,
        Final: 0.01
      }[b.s_type];
    return b_score - a_score;
  });

  // Redraw UI
  let new_ui = document.createElement("div");
  new_ui.id = "subjects";
  for (let subject of subjects_data) {
    if (
      subject.s_id === "" ||
      subject.s_name === "" ||
      subject.s_year === "" ||
      subject.s_type === "" ||
      subject.s_term === ""
    )
      continue;
    let el = document.createElement("a");
    el.classList += "subject";
    el.href = subject.s_link;
    el.setAttribute("role", "article");
    let formattedHTML = [
      '<div class="sid">',
      subject.s_id,
      '</div><div class="stype">',
      subject.s_type,
      '</div><div class="syear">เทอม ',
      subject.s_term,
      "/",
      subject.s_year,
      '</div><div class="spacer"></div>',
      '<div class="sname">',
      subject.s_name,
      "</div>",
      subject.s_cnum ? '<div class="scnum">' + subject.s_cnum + "</div>" : ""
    ].join("");
    el.innerHTML = formattedHTML;
    new_ui.appendChild(el);
  }

  // Inject
  data_element.parentNode.appendChild(new_ui);
  data_element.parentNode.removeChild(data_element);
}

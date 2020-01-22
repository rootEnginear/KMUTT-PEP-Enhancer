"use strict";

// // Get Data
// let data_element = <HTMLElement>document.querySelector("table[border='1']");
// let subjects_string = data_element?.innerText;
// let subject_link_nodelist = document.querySelectorAll("table[border='1'] a");
// let subject_link_array = <HTMLAnchorElement[]>[];
// for (
//   let i = -1, l = subject_link_nodelist.length;
//   ++i !== l;
//   subject_link_array[i] = <HTMLAnchorElement>subject_link_nodelist[i]
// );
// let subjects_link = subject_link_array.map(link => link.href);
// let pagination_string = (<HTMLElement>(
//   document.querySelector("table[border='0'] > tbody > tr > td:nth-child(4)")
// ))?.innerText?.trim();
// let pagination_string_matcher = /Records\s*\d+\s*to\s*\d+\s*of\s*(\d+)/g;
// let total_page = +(pagination_string_matcher.exec(pagination_string) ?? [])[1];
// // console.log(total_page);

// interface SUBJECTDATA {
//   s_id: string;
//   s_name: string;
//   s_cnum: string;
//   s_year: number;
//   s_term: number;
//   s_type: string;
//   s_link: string;
// }

// function rawSubjectStringToArray(raw_subject_string: string): string[] {
//   let [oddLines, evenLines] = raw_subject_string
//     .split("\n")
//     .reduce(
//       ([left, right], current, index) =>
//         index % 2 ? [left, right.concat(current)] : [left.concat(current), right],
//       [<string[]>[], <string[]>[]]
//     );
//   return oddLines.map((line, index) => line + evenLines[index]);
// }

// function subjectArrayToObject(subject_array: string[]): SUBJECTDATA[] {
//   return subject_array.map(
//     (subject, index): SUBJECTDATA => {
//       let matcher = /\d+\s*รหัสวิขา\s*(.+?)\s*ชื่อวิชา\s*(.+?)\s*Call Number\s*(.+?)\s*ปีการศีกษา\s*(.+?)\s*ภาคเรียน\s*(.+?)\s*ข้อสอบ\s*(.*)/g;
//       let matches = matcher.exec(subject) ?? <string[]>[];
//       return {
//         s_id: matches[1].trim(),
//         s_name: matches[2].trim(),
//         s_cnum: matches[3].trim(),
//         s_year: +matches[4].trim(),
//         s_term: +matches[5].trim(),
//         s_type: matches[6].trim(),
//         s_link: subjects_link[index]
//       };
//     }
//   );
// }

// function subjectSorter(a: SUBJECTDATA, b: SUBJECTDATA) {
//   const Term = (type: string) => (type === "Mid-Term" ? 0 : 0.01);
//   let a_score = a.s_year + a.s_term * 0.1 + Term(a.s_type);
//   let b_score = b.s_year + b.s_term * 0.1 + Term(b.s_type);
//   return b_score - a_score;
// }

// function SubjectCard(subject_object: SUBJECTDATA): HTMLElement {
//   // create element
//   let el = document.createElement("a");
//   // stylize element
//   el.classList.add("subject");
//   el.href = subject_object.s_link;
//   el.setAttribute("role", "article");
//   // draw HTML contents
//   let html_contents = `<div class="sid">${subject_object.s_id}</div><div class="stype">${
//     subject_object.s_type
//   }</div><div class="syear">เทอม ${subject_object.s_term}/${
//     subject_object.s_year
//   }</div><div class="spacer"></div><div class="sname">${subject_object.s_name}</div>${
//     subject_object.s_cnum ? `<div class="scnum">${subject_object.s_cnum}</div>` : ""
//   }`;
//   // inject HTML contents
//   el.innerHTML = html_contents;
//   return el;
// }

// if (total_page) {
//   // Transform Data
//   let subjects_array = rawSubjectStringToArray(subjects_string);
//   let subjects_data = subjectArrayToObject(subjects_array);
//   // Sort data
//   subjects_data.sort(subjectSorter);
//   // Redraw UI
//   let new_ui = document.createElement("div");
//   new_ui.id = "subjects";
//   for (let subject of subjects_data) {
//     if (
//       subject.s_id === "" ||
//       subject.s_name === "" ||
//       subject.s_year === 0 ||
//       subject.s_type === "" ||
//       subject.s_term === 0
//     )
//       continue;
//     new_ui.appendChild(SubjectCard(subject));
//   }

//   // Inject
//   data_element?.parentNode?.appendChild(new_ui);
//   data_element?.parentNode?.removeChild(data_element);
// }

// @ts-ignore
fetch(chrome.extension.getURL("/index.html"))
  .then(r => r.text())
  .then(html => {
    // Add original data into new document
    let originalData = document.createElement("div");
    originalData.id = "originalData";
    originalData.style.display = "none";
    originalData.innerHTML =
      document.querySelector("td[align=center]")?.innerHTML || document.body.innerHTML;
    // Replace HTML
    document.getElementsByTagName("html")[0].innerHTML = html;
    // Insert original data
    document.body.appendChild(originalData);
    // Create `script` for loading Vue
    let vuescript = document.createElement("script");
    vuescript.setAttribute("src", "https://cdn.jsdelivr.net/npm/vue/dist/vue.js");
    vuescript.setAttribute("onload", "init()");
    document.body.appendChild(vuescript);
    // Create `script` for Vue app
    let vueapp = document.createElement("script");
    vueapp.innerHTML = `
      var app;

      function init() {
        app = new Vue({
          el: "#app",
          created: function() {
            var originalData = document.getElementById("originalData");
            this.parseHTML(originalData.innerHTML);
            originalData.parentNode.removeChild(originalData)
            this.pep_call = (new URLSearchParams(location.search)).get("pep_call");
          },
          data: {
            currentCursor: 10,
            subjects: [],
            subjectSearch: "",
            filterSearchText: "",
            pep_call: ""
          },
          methods: {
            parseHTML: function(htmlString) {
              var parser = new DOMParser();
              var htmlDoc = parser.parseFromString(htmlString, "text/html");
              var _a, _b, _c, _d, _e, _f, _g, _h;

              // Get Data
              var data_element = htmlDoc.querySelector("table[border='1']");
              var subjects_string =
                (_a = data_element) === null || _a === void 0 ? void 0 : _a.innerText;
              var subject_link_nodelist = htmlDoc.querySelectorAll("table[border='1'] a");
              var subject_link_array = [];
              for (
                var i = -1, l = subject_link_nodelist.length;
                ++i !== l;
                subject_link_array[i] = subject_link_nodelist[i]
              );
              var subjects_link = subject_link_array.map(function(link) {
                return link.href;
              });
              // TESTING
              var formatted_subjects_string = subjects_string.replace(/\\s+/g," ").replace(/Number ปี/g,"Number - ปี").trim();
              var matcher = /\\d+\\s*รหัสวิขา\\s*(.+?)\\s*ชื่อวิชา\\s*(.+?)\\s*Call Number\\s*(.+?)\\s*ปีการศีกษา\\s*(.+?)\\s*ภาคเรียน\\s*(.+?)\\s*ข้อสอบ\\s*(.+?)\\s*/g;
              var matches = [...formatted_subjects_string.matchAll(matcher)];
              function subjectSorter(a, b) {
                const Term = type => (type === "Mid-Term" ? 0 : 0.01);
                let a_score = a.s_year + a.s_term * 0.1 + Term(a.s_type);
                let b_score = b.s_year + b.s_term * 0.1 + Term(b.s_type);
                return b_score - a_score;
              }
              this.subjects = (this.subjects || []).concat(matches.map(function(e,index){return (
                {
                  s_id: e[1],
                  s_name: e[2],
                  s_cnum: e[3],
                  s_year: +e[4],
                  s_term: +e[5],
                  s_type: {"F":"Final","M":"Mid-Term"}[e[6]],
                  s_link: subjects_link[index]
                }
              )})).sort(subjectSorter);
            },
            fetchData: function(){
              var pep_call_params = this.pep_call || "";
              fetch("https://modps5.lib.kmutt.ac.th/services/research/specialdbs/pep.jsp?pep_call="+pep_call_params+"&offset="+this.currentCursor)
                .then(e => e.text())
                .then(e => this.parseHTML(e));
              this.currentCursor += 10;
            },
            searchSubject: function(){
              if(this.subjectSearch.trim === "") return;
              this.pep_call = encodeURIComponent(this.subjectSearch);
              fetch("https://modps5.lib.kmutt.ac.th/services/research/specialdbs/pep.jsp?pep_call="+this.pep_call)
                .then(e => e.text())
                .then(e => {
                  this.currentCursor = 10;
                  this.subjects = [];
                  this.parseHTML(e);
                });
            }
          }
        });
      }
    `;
    document.body.appendChild(vueapp);
  });

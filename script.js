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
    .then(function (r) { return r.text(); })
    .then(function (html) {
    var _a;
    // Add original data into new document
    var originalData = document.createElement("div");
    originalData.id = "originalData";
    originalData.style.display = "none";
    originalData.innerHTML =
        ((_a = document.querySelector("td[align=center]")) === null || _a === void 0 ? void 0 : _a.innerHTML) || document.body.innerHTML;
    // Replace HTML
    document.getElementsByTagName("html")[0].innerHTML = html;
    // Insert original data
    document.body.appendChild(originalData);
    // Create `script` for loading Vue
    var vuescript = document.createElement("script");
    vuescript.setAttribute("src", "https://cdn.jsdelivr.net/npm/vue/dist/vue.js");
    vuescript.setAttribute("onload", "init()");
    document.body.appendChild(vuescript);
    // Create `script` for Vue app
    var vueapp = document.createElement("script");
    vueapp.innerHTML = "\n      var app;\n\n      function init() {\n        app = new Vue({\n          el: \"#app\",\n          created: function() {\n            var originalData = document.getElementById(\"originalData\");\n            this.parseHTML(originalData.innerHTML);\n            originalData.parentNode.removeChild(originalData)\n            this.pep_call = (new URLSearchParams(location.search)).get(\"pep_call\");\n          },\n          data: {\n            currentCursor: 10,\n            subjects: [],\n            subjectSearch: \"\",\n            filterSearchText: \"\",\n            pep_call: \"\"\n          },\n          methods: {\n            parseHTML: function(htmlString) {\n              var parser = new DOMParser();\n              var htmlDoc = parser.parseFromString(htmlString, \"text/html\");\n              var _a, _b, _c, _d, _e, _f, _g, _h;\n\n              // Get Data\n              var data_element = htmlDoc.querySelector(\"table[border='1']\");\n              var subjects_string =\n                (_a = data_element) === null || _a === void 0 ? void 0 : _a.innerText;\n              var subject_link_nodelist = htmlDoc.querySelectorAll(\"table[border='1'] a\");\n              var subject_link_array = [];\n              for (\n                var i = -1, l = subject_link_nodelist.length;\n                ++i !== l;\n                subject_link_array[i] = subject_link_nodelist[i]\n              );\n              var subjects_link = subject_link_array.map(function(link) {\n                return link.href;\n              });\n              // TESTING\n              var formatted_subjects_string = subjects_string.replace(/\\s+/g,\" \").replace(/Number \u0E1B\u0E35/g,\"Number - \u0E1B\u0E35\").trim();\n              var matcher = /\\d+\\s*\u0E23\u0E2B\u0E31\u0E2A\u0E27\u0E34\u0E02\u0E32\\s*(.+?)\\s*\u0E0A\u0E37\u0E48\u0E2D\u0E27\u0E34\u0E0A\u0E32\\s*(.+?)\\s*Call Number\\s*(.+?)\\s*\u0E1B\u0E35\u0E01\u0E32\u0E23\u0E28\u0E35\u0E01\u0E29\u0E32\\s*(.+?)\\s*\u0E20\u0E32\u0E04\u0E40\u0E23\u0E35\u0E22\u0E19\\s*(.+?)\\s*\u0E02\u0E49\u0E2D\u0E2A\u0E2D\u0E1A\\s*(.+?)\\s*/g;\n              var matches = [...formatted_subjects_string.matchAll(matcher)];\n              function subjectSorter(a, b) {\n                const Term = type => (type === \"Mid-Term\" ? 0 : 0.01);\n                let a_score = a.s_year + a.s_term * 0.1 + Term(a.s_type);\n                let b_score = b.s_year + b.s_term * 0.1 + Term(b.s_type);\n                return b_score - a_score;\n              }\n              this.subjects = (this.subjects || []).concat(matches.map(function(e,index){return (\n                {\n                  s_id: e[1],\n                  s_name: e[2],\n                  s_cnum: e[3],\n                  s_year: +e[4],\n                  s_term: +e[5],\n                  s_type: {\"F\":\"Final\",\"M\":\"Mid-Term\"}[e[6]],\n                  s_link: subjects_link[index]\n                }\n              )})).sort(subjectSorter);\n            },\n            fetchData: function(){\n              var pep_call_params = this.pep_call || \"\";\n              fetch(\"https://modps5.lib.kmutt.ac.th/services/research/specialdbs/pep.jsp?pep_call=\"+pep_call_params+\"&offset=\"+this.currentCursor)\n                .then(e => e.text())\n                .then(e => this.parseHTML(e));\n              this.currentCursor += 10;\n            },\n            searchSubject: function(){\n              if(this.subjectSearch.trim === \"\") return;\n              this.pep_call = encodeURIComponent(this.subjectSearch);\n              fetch(\"https://modps5.lib.kmutt.ac.th/services/research/specialdbs/pep.jsp?pep_call=\"+this.pep_call)\n                .then(e => e.text())\n                .then(e => {\n                  this.currentCursor = 10;\n                  this.subjects = [];\n                  this.parseHTML(e);\n                });\n            }\n          }\n        });\n      }\n    ";
    document.body.appendChild(vueapp);
});

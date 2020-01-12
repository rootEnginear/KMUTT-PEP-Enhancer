"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h;
// Get Data
var data_element = document.querySelector("table[border='1']");
var subjects_string = (_a = data_element) === null || _a === void 0 ? void 0 : _a.innerText;
var subject_link_nodelist = document.querySelectorAll("table[border='1'] a");
var subject_link_array = [];
for (var i = -1, l = subject_link_nodelist.length; ++i !== l; subject_link_array[i] = subject_link_nodelist[i])
    ;
var subjects_link = subject_link_array.map(function (link) { return link.href; });
var pagination_string = (_c = (_b = document.querySelector("table[border='0'] > tbody > tr > td:nth-child(4)")) === null || _b === void 0 ? void 0 : _b.innerText) === null || _c === void 0 ? void 0 : _c.trim();
var pagination_string_matcher = /Records\s*\d+\s*to\s*\d+\s*of\s*(\d+)/g;
var total_page = +(_d = pagination_string_matcher.exec(pagination_string), (_d !== null && _d !== void 0 ? _d : []))[1];
function rawSubjectStringToArray(raw_subject_string) {
    var _a = raw_subject_string
        .split("\n")
        .reduce(function (_a, current, index) {
        var left = _a[0], right = _a[1];
        return index % 2 ? [left, right.concat(current)] : [left.concat(current), right];
    }, [[], []]), oddLines = _a[0], evenLines = _a[1];
    return oddLines.map(function (line, index) { return line + evenLines[index]; });
}
function subjectArrayToObject(subject_array) {
    return subject_array.map(function (subject, index) {
        var _a;
        var matcher = /\d+\s*รหัสวิขา\s*(.+?)\s*ชื่อวิชา\s*(.+?)\s*Call Number\s*(.+?)\s*ปีการศีกษา\s*(.+?)\s*ภาคเรียน\s*(.+?)\s*ข้อสอบ\s*(.*)/g;
        var matches = (_a = matcher.exec(subject), (_a !== null && _a !== void 0 ? _a : []));
        return {
            s_id: matches[1].trim(),
            s_name: matches[2].trim(),
            s_cnum: matches[3].trim(),
            s_year: +matches[4].trim(),
            s_term: +matches[5].trim(),
            s_type: matches[6].trim(),
            s_link: subjects_link[index]
        };
    });
}
function subjectSorter(a, b) {
    var Term = function (type) { return (type === "Mid-Term" ? 0 : 0.01); };
    var a_score = a.s_year + a.s_term * 0.1 + Term(a.s_type);
    var b_score = b.s_year + b.s_term * 0.1 + Term(b.s_type);
    return b_score - a_score;
}
function SubjectCard(subject_object) {
    // create element
    var el = document.createElement("a");
    // stylize element
    el.classList.add("subject");
    el.href = subject_object.s_link;
    el.setAttribute("role", "article");
    // draw HTML contents
    var html_contents = "<div class=\"sid\">" + subject_object.s_id + "</div><div class=\"stype\">" + subject_object.s_type + "</div><div class=\"syear\">\u0E40\u0E17\u0E2D\u0E21 " + subject_object.s_term + "/" + subject_object.s_year + "</div><div class=\"spacer\"></div><div class=\"sname\">" + subject_object.s_name + "</div>" + (subject_object.s_cnum ? "<div class=\"scnum\">" + subject_object.s_cnum + "</div>" : "");
    // inject HTML contents
    el.innerHTML = html_contents;
    return el;
}
if (total_page) {
    // Transform Data
    var subjects_array = rawSubjectStringToArray(subjects_string);
    var subjects_data = subjectArrayToObject(subjects_array);
    // Sort data
    subjects_data.sort(subjectSorter);
    // Redraw UI
    var new_ui = document.createElement("div");
    new_ui.id = "subjects";
    for (var _i = 0, subjects_data_1 = subjects_data; _i < subjects_data_1.length; _i++) {
        var subject = subjects_data_1[_i];
        if (subject.s_id === "" ||
            subject.s_name === "" ||
            subject.s_year === 0 ||
            subject.s_type === "" ||
            subject.s_term === 0)
            continue;
        new_ui.appendChild(SubjectCard(subject));
    }
    // Inject
    (_f = (_e = data_element) === null || _e === void 0 ? void 0 : _e.parentNode) === null || _f === void 0 ? void 0 : _f.appendChild(new_ui);
    (_h = (_g = data_element) === null || _g === void 0 ? void 0 : _g.parentNode) === null || _h === void 0 ? void 0 : _h.removeChild(data_element);
}

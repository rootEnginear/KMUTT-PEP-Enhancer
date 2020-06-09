// Most edge cases: https://modps5.lib.kmutt.ac.th/services/research/specialdbs/pep.jsp?pep_call=CPE+100&offset=40

const vueapp = (original_data) => {
  new Vue({
    el: "#app",
    created() {
      [this.subjects, this.current_cursor, this.total_record] = this.phaser(
        original_data
      );
      this.pep_call = new URLSearchParams(location.search).get("pep_call");
    },
    data() {
      return {
        subjects: [],
        subject_search: "",
        current_cursor: 0,
        total_record: 1,
        pep_call: 0,
        sorting_prioirty: [],
        custom_key: null,
      };
    },
    methods: {
      phaser(doc) {
        const mergeEven = (a, c, i) => {
          if (i % 2 === 0) return [...a, [c]];
          let prev = a;
          const last = Math.floor(i / 2);
          prev[last] = [...prev[last], c];
          return prev;
        };

        const removeSpaces = (str) => str.replace(/\s+/g, " ").trim();

        const getLink = (element) => (element && element.href) || "#";
        const extractLink = (el) => [
          removeSpaces(el.innerText),
          getLink(el.querySelector("a")),
        ];

        const extractData = (str) => {
          const pattern = /\d+ รหัสวิขา (.+?) ชื่อวิชา (.+?) Call Number(.*?) ปีการศีกษา (\d{4}) ภาคเรียน (.+?) ข้อสอบ (.+?) ลิงก์ (.+)/;
          const matches = pattern.exec(str) || ["", "", "", "", "", "", ""];
          // Term can be "1", "2", "1,2"
          const formatted_term = isNaN(+matches[5])
            ? matches[5].split(",").map((e) => +e)
            : [+matches[5]];
          // Type can by "Mid-Term", "Final", "Mid-Term,Final"
          const formatted_type = matches[6].split(",");
          // Link can be a link or "#"
          const formatted_link =
            matches[7].trim() === "#" ? "" : matches[7].trim();
          return {
            s_id: matches[1].trim(),
            s_name: matches[2].trim(),
            s_cnum: matches[3].trim(),
            s_year: +matches[4].trim(),
            s_term: formatted_term,
            s_type: formatted_type,
            s_link: formatted_link,
            s_key: Date.now() * Math.random(),
          };
        };

        const pagination_element = doc.querySelector(
          "table[border='0'] > tbody > tr > td:nth-child(4)"
        );
        const pagination_string = removeSpaces(
          (pagination_element && pagination_element.innerHTML) || ""
        );
        const pagination_string_matcher = /Records \d+ to (\d+) of (\d+)/g;
        const pagination_string_matches = pagination_string_matcher.exec(
          pagination_string
        );
        const current_cursor = +((pagination_string_matches || [])[1] || "");
        const total_record = +((pagination_string_matches || [])[2] || "");

        return [
          Array.prototype.slice
            .call(doc.querySelectorAll("table[border='1']>tbody>tr"))
            .reduce(mergeEven, [])
            .map((e) => [extractLink(e[0]), removeSpaces(e[1].innerText)])
            .map((e) => removeSpaces(`${e[0][0]} ${e[1]} ลิงก์ ${e[0][1]}`))
            .map(extractData),
          current_cursor,
          total_record,
        ];
      },
      href(url) {
        return url && (window.location.href = url);
      },
      searchSubject() {
        if (this.subject_search === "") return;
        this.pep_call = encodeURIComponent(this.subject_search);
        fetch(
          `https://modps5.lib.kmutt.ac.th/services/research/specialdbs/pep.jsp?pep_call=${this.pep_call}`
        )
          .then((e) => e.text())
          .then((html_string) => {
            const html_dom = document
              .createRange()
              .createContextualFragment(html_string);
            [
              this.subjects,
              this.current_cursor,
              this.total_record,
            ] = this.phaser(html_dom);
          });
      },
      downloadExam({ s_link }) {
        return this.href(s_link);
      },
      fetchData() {
        const pep_call_params = this.pep_call || "";
        fetch(
          `https://modps5.lib.kmutt.ac.th/services/research/specialdbs/pep.jsp?pep_call=${pep_call_params}&offset=${this.current_cursor}`
        )
          .then((e) => e.text())
          .then((html_string) => {
            const html_dom = document
              .createRange()
              .createContextualFragment(html_string);
            const [subjects, current_cursor, total_record] = this.phaser(
              html_dom
            );
            this.subjects = this.subjects.concat(subjects);
            this.current_cursor = current_cursor;
            this.total_record = total_record;
          });
      },
      debug(event) {
        return console.log("Method called! ", event);
      },
    },
  });
};

(function () {
  fetch(chrome.extension.getURL("/index.html"))
    .then((r) => r.text())
    .then((html) => {
      // Save old Document
      const original_data = document.cloneNode(true);
      // Replace HTML
      document.getElementsByTagName("html")[0].innerHTML = html;
      // Run Vue
      vueapp(original_data);
    });
})();

// Known edge cases:
// 1. มี 2 รหัสวิชา (CPE 100,CVE 100 2 Final 2550)
// 2. มี 2 เทอม (CPE 100 1,2 Mid-Term,Final 2549)
// 3. มีทั้ง Mid-Term และ Final (CPE 100 1,2 Mid-Term,Final 2549)
// 4. ไม่มีลิงก์ให้ดาวน์โหลดข้อสอบ (CPE 100 1,2 Mid-Term,Final 2549)
// 5. ไม่มีชื่อข้อสอบ (CP เทอม 2 Mid-Term 2561)

const CURRENT_YEAR = new Date().getFullYear() + 543;

const vueapp = (original_data) => {
  new Vue({
    el: "#app",
    created() {
      this.host = location.origin + location.pathname;

      this.anchor_element = document.createElement("a");
      this.anchor_element.target = "_blank";

      [this.subjects, this.current_cursor, this.total_record] = this.phaser(
        original_data
      );
      this.pep_call = new URLSearchParams(location.search).get("pep_call");

      window.addEventListener("scroll", () => {
        clearTimeout(this.show_goup_button_timeout);
        this.show_goup_button_timeout = setTimeout(() => {
          this.show_goup_button =
            (document.documentElement.scrollTop || document.body.scrollTop) > 150;
        }, 500);
      });
    },
    data() {
      return {
        host: null,
        subjects: [],
        subject_search: "",
        current_cursor: 0,
        total_record: 1,
        pep_call: 0,
        show_filter_box: false,
        filter_timeout: null,
        filter: {
          name: null,
          type: ["Mid-Term", "Final"],
          term: [1, 2],
          start_year: 2503,
          end_year: CURRENT_YEAR,
          min_year: 2503,
          max_year: CURRENT_YEAR,
        },
        filter_linted: {
          name: null,
          type: ["Mid-Term", "Final"],
          term: [1, 2],
          start_year: 2503,
          end_year: CURRENT_YEAR,
        },
        anchor_element: null,
        show_goup_button_timeout: null,
        show_goup_button: false,
        is_searching_subject: false,
        is_filter_waiting: false,
        is_fetching_data: false,
      };
    },
    computed: {
      subjects_filtered() {
        let filtered_subjects = this.subjects;
        const { name, type, term, start_year, end_year } = this.filter_linted;
        // If there is a name, filter it
        if (name) {
          filtered_subjects = filtered_subjects.filter(({ s_name }) =>
            s_name.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"))
          );
        }
        // Filter term
        // Find which term is not in the array
        const filter_out_term = [[1, 2], term].reduce((a, b) =>
          a.filter((c) => !b.includes(c))
        );
        if (filter_out_term.length) {
          filtered_subjects = filtered_subjects.filter(
            ({ s_term }) =>
              [s_term, filter_out_term].reduce((a, b) => a.filter((c) => !b.includes(c)))
                .length
          );
        }
        // Filter type
        // Find which type is not in the array
        const filter_out_type = [["Mid-Term", "Final"], type].reduce((a, b) =>
          a.filter((c) => !b.includes(c))
        );
        if (filter_out_type.length) {
          filtered_subjects = filtered_subjects.filter(
            ({ s_type }) =>
              [s_type, filter_out_type].reduce((a, b) => a.filter((c) => !b.includes(c)))
                .length
          );
        }
        // Filter years
        filtered_subjects = filtered_subjects.filter(
          ({ s_year }) => s_year >= start_year && s_year <= end_year
        );
        return filtered_subjects;
      },
    },
    watch: {
      filter: {
        handler(val) {
          this.is_filter_waiting = true;
          clearTimeout(this.filter_timeout);
          this.filter_timeout = setTimeout((_) => {
            // Year validating
            if (val.start_year < val.min_year) this.filter.start_year = val.min_year;
            if (val.start_year > val.max_year) this.filter.start_year = val.max_year;
            if (val.end_year > val.max_year) this.filter.end_year = val.max_year;
            if (val.end_year < val.min_year) this.filter.end_year = val.start_year;
            if (val.end_year < val.start_year) this.filter.end_year = val.start_year;
            // Apply filtering
            this.filter_linted = (({ name, type, term, start_year, end_year }) => ({
              name,
              type,
              term,
              start_year,
              end_year,
            }))(val);
            // Stop spinner
            this.is_filter_waiting = false;
          }, 500);
        },
        deep: true,
      },
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
          const pattern = /\d+ รหัสวิขา (.+?) ชื่อวิชา ?(.+?) ?Call Number(.*?) ปีการศีกษา (\d{4}) ภาคเรียน (.+?) ข้อสอบ (.+?) ลิงก์ (.+)/;
          const matches = pattern.exec(str) || ["", "", "", "", "", "", ""];
          // Term can be "1", "2", "1,2"
          const formatted_term = isNaN(+matches[5])
            ? matches[5].split(",").map((e) => +e)
            : [+matches[5]];
          // Type can by "Mid-Term", "Final", "Mid-Term,Final"
          const formatted_type = matches[6].split(",");
          // Link can be a link or "#"
          const formatted_link = matches[7].trim() === "#" ? "" : matches[7].trim();
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
        if (url) {
          this.anchor_element.href = url;
          this.anchor_element.click();
        }
      },
      searchSubject() {
        if (this.subject_search === "") return;
        this.subject_search = this.subject_search.replace(
          /^([A-Za-z]{3})(\d{3})$/,
          "$1 $2"
        );
        this.pep_call = encodeURIComponent(this.subject_search);
        this.is_searching_subject = true;
        fetch(`${this.host}?pep_call=${this.pep_call}`)
          .then((e) => e.text())
          .then((html_string) => {
            const html_dom = document.createRange().createContextualFragment(html_string);
            [this.subjects, this.current_cursor, this.total_record] = this.phaser(
              html_dom
            );
          })
          .finally((_) => (this.is_searching_subject = false));
      },
      downloadExam({ s_link }) {
        return this.href(s_link);
      },
      fetchData() {
        const pep_call_params = this.pep_call || "";
        this.is_fetching_data = true;
        fetch(`${this.host}?pep_call=${pep_call_params}&offset=${this.current_cursor}`)
          .then((e) => e.text())
          .then((html_string) => {
            const html_dom = document.createRange().createContextualFragment(html_string);
            const [subjects, current_cursor, total_record] = this.phaser(html_dom);
            this.subjects = this.subjects.concat(subjects);
            this.current_cursor = current_cursor;
            this.total_record = total_record;
            this.$nextTick(() => window.scrollTo(0, document.body.scrollHeight));
          })
          .finally((_) => (this.is_fetching_data = false));
      },
      toggleFilterBox() {
        this.show_filter_box = !this.show_filter_box;
        if (this.show_filter_box)
          this.$nextTick(() => this.$refs.subject_name_search.focus());
      },
      clearFilter() {
        this.filter = {
          name: null,
          type: ["Mid-Term", "Final"],
          term: [1, 2],
          start_year: 2503,
          end_year: CURRENT_YEAR,
          min_year: 2503,
          max_year: CURRENT_YEAR,
        };
      },
      goUp() {
        window.scrollTo(0, 0);
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

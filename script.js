    function parsePace(paceStr) {
      const [min, sec] = paceStr.split(":").map(Number);
      return min * 60 + sec;
    }

    function formatTime(seconds) {
      const hrs = Math.floor(seconds / 3600);
      const min = Math.floor((seconds % 3600) / 60);
      const sec = Math.round(seconds % 60);
      return `${hrs.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    function formatPace(secondsPerKm) {
      const min = Math.floor(secondsPerKm / 60);
      const sec = Math.round(secondsPerKm % 60);
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    function updateFromValues() {
      const rows = document.querySelectorAll("#paceTable tbody tr");
      for (let i = 1; i < rows.length; i++) {
        const prevTo = parseFloat(rows[i - 1].querySelector(".to-km").value);
        if (!isNaN(prevTo)) {
          rows[i].querySelector(".from-value").textContent = prevTo.toFixed(1);
        }
      }
    }

    function updateCumulativeTimes() {
      updateFromValues();
      const rows = document.querySelectorAll("#paceTable tbody tr");
      let totalTime = 0;
      let totalDistance = 0;
      let finalSegmentPace = 0;
      rows.forEach((row, index) => {
        const from = parseFloat(row.querySelector(".from-value").textContent);
        const to = parseFloat(row.querySelector(".to-km").value);
        const paceStr = row.cells[2].querySelector("input").value;
        if (!isNaN(from) && !isNaN(to) && paceStr.includes(":")) {
          const pace = parsePace(paceStr);
          const distance = to - from;
          if (distance > 0) {
            totalTime += distance * pace;
            totalDistance += distance;
            row.querySelector(".cumulative").textContent = formatTime(totalTime);
            if (index === rows.length - 1) {
              finalSegmentPace = pace;
            }
          } else {
            row.querySelector(".cumulative").textContent = "-";
          }
        } else {
          row.querySelector(".cumulative").textContent = "-";
        }
      });

      document.getElementById("totalDistance").textContent = totalDistance.toFixed(1);
      document.getElementById("totalTime").textContent = formatTime(totalTime);
      document.getElementById("averagePace").textContent = totalDistance > 0 ? formatPace(totalTime / totalDistance) : "00:00";

      const adjustedDistance = totalDistance * 1.01;
      const extraDistance = adjustedDistance - totalDistance;
      const realisticTime = totalTime + extraDistance * finalSegmentPace;
      document.getElementById("adjustedDistance").textContent = adjustedDistance.toFixed(2);
      document.getElementById("realisticTime").textContent = formatTime(realisticTime);
    }

    function addRow() {
      const rows = document.querySelectorAll("#paceTable tbody tr");
      const lastRow = rows[rows.length - 1];
      const from = parseFloat(lastRow.querySelector(".to-km").value);
      const lastPace = lastRow.cells[2].querySelector("input").value;
      if (lastRow.querySelector(".to-km").value !== "" && isNaN(from)) return;
      const to = "";
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td class="from-value">${from.toFixed(1)}</td>
        <td><input type="number" step="0.1" class="to-km" value="" autofocus></td>
        <td><input type="text" placeholder="mm:ss" value="${lastPace}"></td>
        <td class="cumulative"></td>
        <td><button class="delete-btn" title="Delete" onclick="removeRow(this)"><i class="fas fa-trash"></i></button></td>
      `;
      document.querySelector("#paceTable tbody").appendChild(newRow);
      updateCumulativeTimes();
      newRow.querySelector(".to-km").focus();
    }

    function removeRow(button) {
      const row = button.closest("tr");
      row.remove();
      updateCumulativeTimes();
    }

    document.querySelector("#paceTable").addEventListener("input", updateCumulativeTimes);
    document.querySelector("#addSegmentBtn").addEventListener("click", addRow);
    updateCumulativeTimes(); // trigger initial calculation

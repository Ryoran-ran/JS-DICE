const SaikoroMany = document.getElementById("SaikoroMany");
const SaikoroPray = document.getElementById("SaikoroPray");
const SaikoroLog = document.getElementById("SaikoroLog");
const SaikoroTokei = document.getElementById("SaikoroTokei");
const Tokei_Reset = document.getElementById("Tokei_Reset");

const diceTableBody = document.getElementById("diceTableBody");
const addRowBtn = document.getElementById("addRowBtn");

let Saikoro = [];
let Saikoro_syukei = [0,0,0,0,0,0];

let diceChart = null;

let SumHistory = {};     // 合計値: 出現回数（例: {7: 2, 10: 1}）
let SumMin = null;
let SumMax = null;

Setup();

// 初期行を1行追加
addDiceRow();

// 行追加ボタンのイベント
addRowBtn.addEventListener("click", addDiceRow);

function addDiceRow() {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="number" class="diceSides" value="6" min="2" max="50"></td>
    <td><input type="number" class="diceCount" value="1" min="1" max="100"></td>
    <td><button class="deleteRowBtn">削除</button></td>
  `;

  diceTableBody.appendChild(row);

  // 削除ボタンにイベント追加
  row.querySelector(".deleteRowBtn").addEventListener("click", () => {
    row.remove();
  });
}

function Setup(){
  Output_toukei();  
}

SaikoroPray.addEventListener("click",function(event){
  Output_Result();
  Output_toukei();
});

Tokei_Reset.addEventListener("click",function(event){
  SumHistory = {};
  SumMin = null;
  SumMax = null;
  Output_toukei();
});

function Output_Result() {
  SaikoroLog.innerHTML = "";
  let Log = ""

  
  
  for(let i = 1; i<=SaikoroMany.value; i++){
    // 合計値を履歴に記録
    const { min, max } = getSumRangeFromTable();
    const { labels, data } = generateSumLabelsAndData(min, max);
    const result = rollAllDiceAndCountSums(min, data);

    SumHistory[result] = (SumHistory[result] || 0) + 1;
    if (SumMin === null || result < SumMin) SumMin = result;
    if (SumMax === null || result > SumMax) SumMax = result;

    Log += `<strong>今回の合計：</strong> ${result}<br>`;

    SaikoroLog.innerHTML = Log;

    Output_toukei(); // 統計再描画
  }

  
}

function Sikoro_korokoro() {
  const rows = document.querySelectorAll("#diceTableBody tr");
  let total = 0;

  rows.forEach(row => {
    const cells = row.children;
    const sizeInput = cells[0]?.querySelector(".diceSides");
    const countInput = cells[1]?.querySelector(".diceCount");

    const size = parseInt(sizeInput?.value || "6", 10);
    const howmany = parseInt(countInput?.value || "1", 10);

    for (let i = 0; i < howmany; i++) {
      total += getRandomInt(1, size);
    }
  });

  return total;
}


function Output_toukei() {
  SaikoroTokei.innerHTML = "";

  if (SumMin === null || SumMax === null) {
    SaikoroTokei.innerHTML = "履歴がありません。";
    drawChart(null, null);
    return;
  }

  const labels = [];
  const data = [];

  let totalCount = 0;
  let totalSum = 0;

  for (let i = SumMin; i <= SumMax; i++) {
    const count = SumHistory[i] || 0;
    labels.push(i.toString());
    data.push(count);
    totalCount += count;
    totalSum += i * count;
  }

  const average = totalCount ? (totalSum / totalCount).toFixed(2) : 0;

  SaikoroTokei.innerHTML += `<strong>回数：</strong> ${totalCount}<br>`;
  SaikoroTokei.innerHTML += `<strong>合計：</strong> ${totalSum}<br>`;
  SaikoroTokei.innerHTML += `<strong>平均：</strong> ${average}<br>`;

  drawChart(labels, data);
}

function drawChart(labels, data) {
  const ctx = document.getElementById("diceChart").getContext("2d");

  if (diceChart) {
    diceChart.destroy();
  }

  diceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      // labels: [1,2,3,4,5,6],
      datasets: [{
        label: '出現回数',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          precision: 0
        }
      }
    }
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSumRangeFromTable() {
  const rows = document.querySelectorAll("#diceTableBody tr");
  let min = 0;
  let max = 0;

  rows.forEach(row => {
    const face = parseInt(row.querySelector(".diceSides")?.value || "6", 10);
    const count = parseInt(row.querySelector(".diceCount")?.value || "1", 10);

    min += count * 1;          // 各サイコロの最小値
    max += count * face;       // 各サイコロの最大値
  });

  return { min, max };
}

function generateSumLabelsAndData(min, max) {
  const labels = [];
  const data = [];

  for (let sum = min; sum <= max; sum++) {
    labels.push(sum.toString());
    data.push(0);
  }

  return { labels, data };
}

function rollAllDiceAndCountSums(min, data) {
  const rows = document.querySelectorAll("#diceTableBody tr");

  let totalSum = 0;

  rows.forEach(row => {
    const face = parseInt(row.querySelector(".diceSides")?.value || "6", 10);
    const count = parseInt(row.querySelector(".diceCount")?.value || "1", 10);

    for (let i = 0; i < count; i++) {
      totalSum += getRandomInt(1, face);
    }
  });

  const index = totalSum - min;
  data[index]++; // 該当の合計値のカウントを+1
  return totalSum;
}
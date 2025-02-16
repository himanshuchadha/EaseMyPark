document.addEventListener("DOMContentLoaded", function () {
  const parkingLot = document.getElementById("parking-lot");

  fetch("/status")
    .then((response) => response.json())
    .then((data) => {
      for (let i = 1; i <= 20; i++) {
        const spot = document.createElement("div");
        spot.className = "parking-spot";
        spot.innerText = i;
        const spotStatus = data.find((s) => s[0] === i);
        if (spotStatus && spotStatus[1] === "occupied") {
          spot.classList.add("occupied");
        }
        spot.addEventListener("click", function () {
          const newStatus = spot.classList.toggle("occupied")
            ? "occupied"
            : "available";
          fetch("/status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: i, status: newStatus }),
          });
        });
        parkingLot.appendChild(spot);
      }
    });
});

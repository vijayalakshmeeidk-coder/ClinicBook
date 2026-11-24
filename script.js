const doctors = [
    {
        id: 1,
        name: "Dr. Sharma",
        specialty: "Cardiologist",
        hospital: "City Care Hospital",
        experience: 10,
        fee: 700
    },
    {
        id: 2,
        name: "Dr. Mehta",
        specialty: "Dermatologist",
        hospital: "Sunrise Clinic",
        experience: 8,
        fee: 500
    },
    {
        id: 3,
        name: "Dr. Kapoor",
        specialty: "Dentist",
        hospital: "Smile Dental Centre",
        experience: 6,
        fee: 400
    },
    {
        id: 4,
        name: "Dr. Rao",
        specialty: "General Physician",
        hospital: "City Care Hospital",
        experience: 12,
        fee: 600
    }
];

const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM"
];

function getAppointments() {
    return JSON.parse(localStorage.getItem("clinicAppointments")) || [];
}

function saveAppointments(appointments) {
    localStorage.setItem("clinicAppointments", JSON.stringify(appointments));
}

function getPatient() {
    return JSON.parse(localStorage.getItem("clinicPatient")) || null;
}

function getDoctor(id) {
  return doctors.find((doc) => Number(doc.id) === Number(id)) || null;
}

function getLoggedInDoctor() {
    return JSON.parse(localStorage.getItem("clinicDoctor")) || null;
}

function showMessage(message) {
    alert(message);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getStatusClass(status) {
    return "status-" + status.toLowerCase();
}

function getToday() {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .split("T")[0];
}

/* PATIENT DASHBOARD */

function loadPatientPage() {
    const patient = getPatient();

    if (patient) {
        document.getElementById("patientWelcome").textContent =
            "Welcome, " + patient.name;

        document.getElementById("patientName").textContent = patient.name;
        document.getElementById("patientPhone").textContent = patient.phone;
        document.getElementById("patientEmail").textContent = patient.email;
        document.getElementById("patientAge").textContent = patient.age;
        document.getElementById("patientGender").textContent = patient.gender;

        document.getElementById("nameInput").value = patient.name;
        document.getElementById("phoneInput").value = patient.phone;
        document.getElementById("emailInput").value = patient.email;
        document.getElementById("ageInput").value = patient.age;
        document.getElementById("genderInput").value = patient.gender;
    }

    document.getElementById("appointmentDate").min = getToday();

    renderDoctors();
    renderPatientAppointments();
}

function savePatientDetails(event) {
    event.preventDefault();

    const patient = {
        name: document.getElementById("nameInput").value.trim(),
        phone: document.getElementById("phoneInput").value.trim(),
        email: document.getElementById("emailInput").value.trim(),
        age: document.getElementById("ageInput").value,
        gender: document.getElementById("genderInput").value
    };

    if (!patient.name || !patient.phone || !patient.email ||
        !patient.age || !patient.gender) {
        showMessage("Please complete all patient details.");
        return;
    }

    localStorage.setItem("clinicPatient", JSON.stringify(patient));

    loadPatientPage();

    showMessage("Patient details saved successfully.");
}

/* DOCTOR LIST */
function getLoggedInDoctor() {
  try {
    const raw = localStorage.getItem("clinicDoctor");
    const saved = raw ? JSON.parse(raw) : null;
    if (saved && saved.id) {
      return getDoctor(saved.id) || doctors[0];
    }
  } catch (err) {
    console.warn("Invalid clinicDoctor data in localStorage:", err);
  }
  return doctors[0];
}

function populateDoctorLoginSelect() {
  // ...
}

function renderDoctors() {
    const searchInput = document.getElementById("doctorSearch");
    const specialtyFilter = document.getElementById("specialtyFilter");
    const doctorList = document.getElementById("doctorList");
    const doctorSelect = document.getElementById("doctorSelect");

    if (!doctorList || !doctorSelect) return;

    const search = searchInput.value.toLowerCase();
    const specialty = specialtyFilter.value;

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch =
            doctor.name.toLowerCase().includes(search) ||
            doctor.specialty.toLowerCase().includes(search) ||
            doctor.hospital.toLowerCase().includes(search);

        const matchesSpecialty =
            specialty === "" || doctor.specialty === specialty;

        return matchesSearch && matchesSpecialty;
    });

    const previousSelection = doctorSelect.value;

    doctorSelect.innerHTML = `
        <option value="">Choose a doctor</option>
        ${doctors.map(doctor => `
            <option value="${doctor.id}">
                ${escapeHTML(doctor.name)} - ${escapeHTML(doctor.specialty)}
            </option>
        `).join("")}
    `;

    doctorSelect.value = previousSelection;

    if (filteredDoctors.length === 0) {
        doctorList.innerHTML =
            '<div class="empty-state">No doctors found.</div>';
        return;
    }

    doctorList.innerHTML = filteredDoctors.map(doctor => `
        <div class="doctor-card">
            <div class="doctor-avatar">
                ${escapeHTML(doctor.name.charAt(0))}
            </div>

            <h3>${escapeHTML(doctor.name)}</h3>

            <div class="doctor-specialty">
                ${escapeHTML(doctor.specialty)}
            </div>

            <div class="doctor-meta">
                ${escapeHTML(doctor.hospital)}
            </div>

            <div class="doctor-meta">
                ${doctor.experience} years of experience
            </div>

            <div class="doctor-meta">
                Consultation Fee: ₹${doctor.fee}
            </div>

            <button class="btn btn-primary-soft"
                onclick="selectDoctor(${doctor.id})">
                Book Appointment
            </button>
        </div>
    `).join("");
}

function selectDoctor(id) {
    document.getElementById("doctorSelect").value = id;
    document.getElementById("selectedSlot").value = "";

    renderSlots();

    document.getElementById("bookingSection").scrollIntoView({
        behavior: "smooth"
    });
}

/* AVAILABLE SLOTS */

function renderSlots() {
    const doctorId = document.getElementById("doctorSelect").value;
    const date = document.getElementById("appointmentDate").value;
    const slotList = document.getElementById("slotList");

    document.getElementById("selectedSlot").value = "";

    if (!doctorId || !date) {
        slotList.innerHTML =
            '<p class="muted-copy">Select a doctor and date to view available slots.</p>';
        return;
    }

    if (date < getToday()) {
        slotList.innerHTML =
            '<div class="empty-state">Please select today or a future date.</div>';
        return;
    }

    const appointments = getAppointments();

    slotList.innerHTML = timeSlots.map(slot => {
        const alreadyBooked = appointments.some(appointment =>
            Number(appointment.doctorId) === Number(doctorId) &&
            appointment.date === date &&
            appointment.time === slot &&
            appointment.status !== "Cancelled"
        );

        return `
            <button
                class="slot-button"
                ${alreadyBooked ? "disabled" : ""}
                onclick="chooseSlot(this, '${slot}')">

                ${slot}
                ${alreadyBooked ? "(Booked)" : ""}

            </button>
        `;
    }).join("");
}

function chooseSlot(button, slot) {
    document.querySelectorAll(".slot-button").forEach(item => {
        item.classList.remove("selected");
    });

    button.classList.add("selected");

    document.getElementById("selectedSlot").value = slot;
}

/* BOOK APPOINTMENT */

function bookAppointment() {
    const patient = getPatient();

    if (!patient) {
        showMessage("Please save your patient details first.");
        return;
    }

    const doctorId = document.getElementById("doctorSelect").value;
    const date = document.getElementById("appointmentDate").value;
    const time = document.getElementById("selectedSlot").value;

    if (!doctorId || !date || !time) {
        showMessage("Please select a doctor, date and time slot.");
        return;
    }

    if (date < getToday()) {
        showMessage("Please select today or a future date.");
        return;
    }

    const appointments = getAppointments();

    const alreadyBooked = appointments.some(appointment =>
        Number(appointment.doctorId) === Number(doctorId) &&
        appointment.date === date &&
        appointment.time === time &&
        appointment.status !== "Cancelled"
    );

    if (alreadyBooked) {
        showMessage("This slot has already been booked.");
        renderSlots();
        return;
    }

    const doctor = getDoctor(doctorId);

    const newAppointment = {
        id: Date.now(),
        patientName: patient.name,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        patientAge: patient.age,
        patientGender: patient.gender,
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital,
        date: date,
        time: time,
        fee: doctor.fee,
        status: "Booked"
    };

    appointments.push(newAppointment);

    saveAppointments(appointments);

    document.getElementById("selectedSlot").value = "";

    renderSlots();
    renderPatientAppointments();

    showMessage("Appointment booked successfully!");
}

/* PATIENT APPOINTMENTS */

function renderPatientAppointments() {
    const patient = getPatient();
    const table = document.getElementById("patientAppointments");

    if (!table) return;

    if (!patient) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center muted-copy">
                    Save your patient details to view appointments.
                </td>
            </tr>
        `;
        return;
    }

    const appointments = getAppointments().filter(appointment =>
        appointment.patientPhone === patient.phone
    );

    if (appointments.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center muted-copy">
                    No appointments booked yet.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = appointments.map(appointment => `
        <tr>
            <td>${escapeHTML(appointment.doctorName)}</td>
            <td>${escapeHTML(appointment.specialty)}</td>
            <td>${escapeHTML(appointment.date)}</td>
            <td>${escapeHTML(appointment.time)}</td>
            <td>
                <span class="status ${getStatusClass(appointment.status)}">
                    ${escapeHTML(appointment.status)}
                </span>
            </td>
            <td>
                ${appointment.status === "Booked" ? `
                    <button class="btn-table danger"
                        onclick="cancelAppointment(${appointment.id})">
                        Cancel
                    </button>
                ` : "-"}
            </td>
        </tr>
    `).join("");
}

function cancelAppointment(id) {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
        return;
    }

    const appointments = getAppointments();

    const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === id) {
            appointment.status = "Cancelled";
        }

        return appointment;
    });

    saveAppointments(updatedAppointments);

    renderPatientAppointments();
    renderSlots();

    showMessage("Appointment cancelled.");
}

/* DOCTOR DASHBOARD */

function populateDoctorLoginSelect(selectedId = "") {
    const select = document.getElementById("doctorLoginSelect");

    if (!select) return;

    select.innerHTML =
        '<option value="">Choose a doctor</option>' +
        doctors.map(doctor => `
            <option value="${doctor.id}"
                ${String(doctor.id) === String(selectedId) ? "selected" : ""}>
                ${escapeHTML(doctor.name)} (${escapeHTML(doctor.specialty)})
            </option>
        `).join("");
}

function saveDoctorLogin(event) {
  event.preventDefault();

  const select = document.getElementById("doctorLoginSelect");
  if (!select) return;

  const selectedDoctor = getDoctor(select.value);
  if (!selectedDoctor) return;

  localStorage.setItem("clinicDoctor", JSON.stringify({ id: selectedDoctor.id }));
  loadDoctorPage();
}

function loadDoctorPage() {
    const activeDoctor = getLoggedInDoctor();

    populateDoctorLoginSelect(activeDoctor ? activeDoctor.id : "");

    const nameEl = document.getElementById("doctorProfileName");
    const specialtyEl = document.getElementById("doctorProfileSpecialty");
    const hospitalEl = document.getElementById("doctorProfileHospital");

    if (activeDoctor) {
        nameEl.textContent = activeDoctor.name;
        specialtyEl.textContent = activeDoctor.specialty;
        hospitalEl.textContent = activeDoctor.hospital;
    } else {
        nameEl.textContent = "Not selected";
        specialtyEl.textContent = "Not selected";
        hospitalEl.textContent = "Not selected";
    }

    renderDoctorAppointments();
}

function renderDoctorAppointments() {
    const table = document.getElementById("doctorAppointments");

    if (!table) return;

    const activeDoctor = getLoggedInDoctor();

    const visibleAppointments = activeDoctor
        ? getAppointments().filter(appointment =>
            Number(appointment.doctorId) === Number(activeDoctor.id)
        )
        : [];

    const booked = visibleAppointments.filter(a => a.status === "Booked").length;
    const completed = visibleAppointments.filter(a => a.status === "Completed").length;

    document.getElementById("totalAppointments").textContent =
        visibleAppointments.length;

    document.getElementById("bookedAppointments").textContent = booked;

    document.getElementById("completedAppointments").textContent = completed;

    if (!activeDoctor) {
        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center muted-copy">
                    Please select a doctor account to view appointments.
                </td>
            </tr>
        `;
        return;
    }

    if (visibleAppointments.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center muted-copy">
                    No appointments available.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = visibleAppointments.map(appointment => `
        <tr>
            <td>${escapeHTML(appointment.patientName)}</td>
            <td>${escapeHTML(appointment.patientPhone)}</td>
            <td>${escapeHTML(appointment.patientEmail)}</td>
            <td>${escapeHTML(appointment.doctorName)}</td>
            <td>${escapeHTML(appointment.date)}</td>
            <td>${escapeHTML(appointment.time)}</td>
            <td>
                <span class="status ${getStatusClass(appointment.status)}">
                    ${escapeHTML(appointment.status)}
                </span>
            </td>
            <td>
                ${appointment.status === "Booked" ? `
                    <button class="btn-table"
                        onclick="completeAppointment(${appointment.id})">
                        Complete
                    </button>
                ` : "-"}
            </td>
        </tr>
    `).join("");
}

function completeAppointment(id) {
    const appointments = getAppointments();

    const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === id) {
            appointment.status = "Completed";
        }

        return appointment;
    });

    saveAppointments(updatedAppointments);

    renderDoctorAppointments();

    showMessage("Appointment marked as completed.");
}

/* RECEPTIONIST DASHBOARD */

function loadReceptionistPage() {
    renderReceptionistAppointments();
}

function renderReceptionistAppointments() {
    const table = document.getElementById("receptionistAppointments");

    if (!table) return;

    const appointments = getAppointments();

    const booked = appointments.filter(a => a.status === "Booked").length;
    const completed = appointments.filter(a => a.status === "Completed").length;

    document.getElementById("receptionTotal").textContent =
        appointments.length;

    document.getElementById("receptionBooked").textContent = booked;

    document.getElementById("receptionCompleted").textContent = completed;

    const search = document.getElementById("receptionSearch").value.toLowerCase();
    const status = document.getElementById("receptionStatus").value;

    const filtered = appointments.filter(appointment => {
        const matchesSearch =
            appointment.patientName.toLowerCase().includes(search) ||
            appointment.doctorName.toLowerCase().includes(search);

        const matchesStatus =
            status === "" || appointment.status === status;

        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center muted-copy">
                    No appointments found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filtered.map(appointment => `
        <tr>
            <td>${escapeHTML(appointment.patientName)}</td>
            <td>${escapeHTML(appointment.patientPhone)}</td>
            <td>${escapeHTML(appointment.patientEmail)}</td>
            <td>${escapeHTML(appointment.doctorName)}</td>
            <td>${escapeHTML(appointment.specialty)}</td>
            <td>${escapeHTML(appointment.date)}</td>
            <td>${escapeHTML(appointment.time)}</td>
            <td>
                <span class="status ${getStatusClass(appointment.status)}">
                    ${escapeHTML(appointment.status)}
                </span>
            </td>
        </tr>
    `).join("");
}

/* PAGE INITIALIZATION */

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("doctorList")) {
    loadPatientPage();
  }

  if (document.getElementById("doctorAppointments") || document.getElementById("doctorLoginSelect")) {
    loadDoctorPage();
  }

  if (document.getElementById("receptionistAppointments")) {
    loadReceptionistPage();
  }

});

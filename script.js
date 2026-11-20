const doctors = [
    {
        id: 1,
        name: "Dr. Sharma",
        specialty: "Cardiologist",
        hospital: "City Care Hospital",
        location: "Bangalore",
        experience: "10 years",
        fee: 700
    },
    {
        id: 2,
        name: "Dr. Mehta",
        specialty: "Dermatologist",
        hospital: "Sunrise Clinic",
        location: "Bangalore",
        experience: "8 years",
        fee: 500
    },
    {
        id: 3,
        name: "Dr. Kapoor",
        specialty: "Dentist",
        hospital: "Smile Dental Centre",
        location: "Bangalore",
        experience: "6 years",
        fee: 400
    },
    {
        id: 4,
        name: "Dr. Rao",
        specialty: "General Physician",
        hospital: "City Care Hospital",
        location: "Bangalore",
        experience: "12 years",
        fee: 600
    }
];

const slots = [
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
    return JSON.parse(localStorage.getItem("clinicPatient")) || {};
}

function savePatient(patient) {
    localStorage.setItem("clinicPatient", JSON.stringify(patient));
}

function showMessage(message) {
    alert(message);
}

function getDoctor(id) {
    return doctors.find(doctor => doctor.id === Number(id));
}

function getStatusClass(status) {
    if (status === "Completed") return "status-completed";
    if (status === "Cancelled") return "status-cancelled";
    return "status-booked";
}

/* PATIENT PAGE */

function loadPatientPage() {
    const patient = getPatient();

    const nameInput = document.getElementById("patientName");
    const phoneInput = document.getElementById("patientPhone");
    const emailInput = document.getElementById("patientEmail");
    const ageInput = document.getElementById("patientAge");
    const genderInput = document.getElementById("patientGender");

    if (patient.name) nameInput.value = patient.name;
    if (patient.phone) phoneInput.value = patient.phone;
    if (patient.email) emailInput.value = patient.email;
    if (patient.age) ageInput.value = patient.age;
    if (patient.gender) genderInput.value = patient.gender;

    document.getElementById("patientWelcome").textContent =
        patient.name ? "Welcome, " + patient.name + "!" : "Welcome, Patient!";

    renderDoctors();
    renderPatientAppointments();
}

function savePatientDetails() {
    const patient = {
        name: document.getElementById("patientName").value.trim(),
        phone: document.getElementById("patientPhone").value.trim(),
        email: document.getElementById("patientEmail").value.trim(),
        age: document.getElementById("patientAge").value,
        gender: document.getElementById("patientGender").value
    };

    if (!patient.name || !patient.phone || !patient.email ||
        !patient.age || !patient.gender) {
        showMessage("Please fill in all your details.");
        return false;
    }

    savePatient(patient);
    document.getElementById("patientWelcome").textContent =
        "Welcome, " + patient.name + "!";

    showMessage("Your details have been saved.");
    return true;
}

function renderDoctors() {
    const container = document.getElementById("doctorList");
    if (!container) return;

    const search = document.getElementById("doctorSearch").value.toLowerCase();
    const specialty = document.getElementById("specialtyFilter").value;

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch =
            doctor.name.toLowerCase().includes(search) ||
            doctor.hospital.toLowerCase().includes(search) ||
            doctor.specialty.toLowerCase().includes(search);

        const matchesSpecialty =
            specialty === "All" || doctor.specialty === specialty;

        return matchesSearch && matchesSpecialty;
    });

    container.innerHTML = "";

    if (filteredDoctors.length === 0) {
        container.innerHTML = '<p class="empty-message">No doctors found.</p>';
        return;
    }

    filteredDoctors.forEach(doctor => {
        container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="doctor-card">
                    <div class="doctor-icon">🩺</div>
                    <h4 class="mt-2">${doctor.name}</h4>
                    <p class="mb-1">${doctor.specialty}</p>
                    <p class="text-secondary mb-1">${doctor.hospital}</p>
                    <p class="text-secondary mb-1">${doctor.location}</p>
                    <p class="text-secondary">Experience: ${doctor.experience}</p>
                    <p><strong>Consultation fee: ₹${doctor.fee}</strong></p>
                    <button class="btn btn-main w-100"
                        onclick="selectDoctor(${doctor.id})">
                        Book Appointment
                    </button>
                </div>
            </div>
        `;
    });
}

function selectDoctor(id) {
    document.getElementById("doctorSelect").value = id;
    document.getElementById("bookingSection").scrollIntoView({
        behavior: "smooth"
    });
    renderSlots();
}

function renderSlots() {
    const doctorId = document.getElementById("doctorSelect").value;
    const date = document.getElementById("appointmentDate").value;
    const container = document.getElementById("slotList");

    container.innerHTML = "";

    if (!doctorId || !date) {
        container.innerHTML = '<p class="text-secondary">Select a doctor and date first.</p>';
        return;
    }

    const appointments = getAppointments();

    slots.forEach(slot => {
        const alreadyBooked = appointments.some(appointment =>
            appointment.doctorId === Number(doctorId) &&
            appointment.date === date &&
            appointment.slot === slot &&
            appointment.status !== "Cancelled"
        );

        container.innerHTML += `
            <button type="button"
                class="btn ${alreadyBooked ? "btn-secondary" : "btn-soft"} m-1"
                ${alreadyBooked ? "disabled" : ""}
                onclick="chooseSlot('${slot}', this)">
                ${slot} ${alreadyBooked ? "(Booked)" : ""}
            </button>
        `;
    });

    document.getElementById("selectedSlot").value = "";
}

function chooseSlot(slot, button) {
    document.getElementById("selectedSlot").value = slot;

    document.querySelectorAll("#slotList button").forEach(btn => {
        btn.classList.remove("btn-main");
        btn.classList.add("btn-soft");
    });

    button.classList.remove("btn-soft");
    button.classList.add("btn-main");
}

function bookAppointment() {
    const patient = getPatient();

    if (!patient.name) {
        showMessage("Please save your patient details first.");
        return;
    }

    const doctorId = Number(document.getElementById("doctorSelect").value);
    const date = document.getElementById("appointmentDate").value;
    const slot = document.getElementById("selectedSlot").value;

    const doctor = getDoctor(doctorId);

    if (!doctor || !date || !slot) {
        showMessage("Please select a doctor, date and time slot.");
        return;
    }

    const selectedDate = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showMessage("Please select today or a future date.");
        return;
    }

    const appointments = getAppointments();

    const alreadyBooked = appointments.some(appointment =>
        appointment.doctorId === doctorId &&
        appointment.date === date &&
        appointment.slot === slot &&
        appointment.status !== "Cancelled"
    );

    if (alreadyBooked) {
        showMessage("Sorry, this slot has already been booked.");
        renderSlots();
        return;
    }

    const appointment = {
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
        slot: slot,
        fee: doctor.fee,
        status: "Booked"
    };

    appointments.push(appointment);
    saveAppointments(appointments);

    showMessage("Your appointment has been booked successfully!");

    document.getElementById("selectedSlot").value = "";
    renderSlots();
    renderPatientAppointments();
}

function renderPatientAppointments() {
    const container = document.getElementById("patientAppointments");
    if (!container) return;

    const patient = getPatient();
    const appointments = getAppointments().filter(appointment =>
        appointment.patientPhone === patient.phone
    );

    container.innerHTML = "";

    if (appointments.length === 0) {
        container.innerHTML = '<p class="empty-message">You have no appointments yet.</p>';
        return;
    }

    appointments.forEach(appointment => {
        container.innerHTML += `
            <tr>
                <td>${appointment.doctorName}</td>
                <td>${appointment.specialty}</td>
                <td>${appointment.date}</td>
                <td>${appointment.slot}</td>
                <td>
                    <span class="status ${getStatusClass(appointment.status)}">
                        ${appointment.status}
                    </span>
                </td>
                <td>
                    ${appointment.status === "Booked" ?
                        `<button class="btn btn-sm btn-outline-danger"
                            onclick="cancelAppointment(${appointment.id})">
                            Cancel
                        </button>` : ""}
                </td>
            </tr>
        `;
    });
}

function cancelAppointment(id) {
    const appointments = getAppointments();
    const appointment = appointments.find(item => item.id === id);

    if (!appointment || appointment.status !== "Booked") return;

    appointment.status = "Cancelled";
    saveAppointments(appointments);

    showMessage("Appointment cancelled.");
    renderPatientAppointments();
    renderSlots();
}

/* DOCTOR PAGE */

function loadDoctorPage() {
    const dateElement = document.getElementById("todayDate");

    if (dateElement) {
        dateElement.textContent = new Date().toDateString();
    }

    renderDoctorAppointments();
}

function renderDoctorAppointments() {
    const container = document.getElementById("doctorAppointments");
    if (!container) return;

    const appointments = getAppointments();
    const active = appointments.filter(item => item.status !== "Cancelled");
    const booked = appointments.filter(item => item.status === "Booked");
    const completed = appointments.filter(item => item.status === "Completed");

    document.getElementById("totalAppointments").textContent = active.length;
    document.getElementById("bookedAppointments").textContent = booked.length;
    document.getElementById("completedAppointments").textContent = completed.length;

    container.innerHTML = "";

    if (appointments.length === 0) {
        container.innerHTML = '<tr><td colspan="7" class="empty-message">No appointments found.</td></tr>';
        return;
    }

    appointments.forEach(appointment => {
        container.innerHTML += `
            <tr>
                <td>${appointment.patientName}</td>
                <td>${appointment.patientPhone}</td>
                <td>${appointment.doctorName}</td>
                <td>${appointment.date}</td>
                <td>${appointment.slot}</td>
                <td>
                    <span class="status ${getStatusClass(appointment.status)}">
                        ${appointment.status}
                    </span>
                </td>
                <td>
                    ${appointment.status === "Booked" ?
                        `<button class="btn btn-sm btn-main"
                            onclick="completeAppointment(${appointment.id})">
                            Complete
                        </button>` : ""}
                </td>
            </tr>
        `;
    });
}

function completeAppointment(id) {
    const appointments = getAppointments();
    const appointment = appointments.find(item => item.id === id);

    if (!appointment || appointment.status !== "Booked") return;

    appointment.status = "Completed";
    saveAppointments(appointments);

    showMessage("Appointment marked as completed.");
    renderDoctorAppointments();
}

/* RECEPTIONIST PAGE */

function loadReceptionistPage() {
    renderReceptionistAppointments();
}

function renderReceptionistAppointments() {
    const container = document.getElementById("receptionistAppointments");
    if (!container) return;

    const appointments = getAppointments();

    document.getElementById("receptionistTotal").textContent =
        appointments.length;

    document.getElementById("receptionistBooked").textContent =
        appointments.filter(item => item.status === "Booked").length;

    container.innerHTML = "";

    if (appointments.length === 0) {
        container.innerHTML = '<tr><td colspan="7" class="empty-message">No appointments found.</td></tr>';
        return;
    }

    appointments.forEach(appointment => {
        container.innerHTML += `
            <tr>
                <td>${appointment.patientName}</td>
                <td>${appointment.patientPhone}</td>
                <td>${appointment.doctorName}</td>
                <td>${appointment.hospital}</td>
                <td>${appointment.date}</td>
                <td>${appointment.slot}</td>
                <td>
                    <span class="status ${getStatusClass(appointment.status)}">
                        ${appointment.status}
                    </span>
                </td>
            </tr>
        `;
    });
}

/* PAGE INITIALIZATION */

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("patientWelcome")) {
        loadPatientPage();
    }

    if (document.getElementById("doctorAppointments")) {
        loadDoctorPage();
    }

    if (document.getElementById("receptionistAppointments")) {
        loadReceptionistPage();
    }
});

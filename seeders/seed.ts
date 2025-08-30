// @ts-nocheck
"use strict";

const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface) => {
    // Load roles
    const [roles] = await queryInterface.sequelize.query(
      `SELECT role_id, name FROM roles`
    );
    const roleMap = {};
    roles.forEach((r) => (roleMap[r.name] = r.role_id));

    const currentYear = new Date().getFullYear();

    // --- Step 1: Create Schools
    const schools = [];
    for (let i = 0; i < 3; i++) {
      schools.push({
        school_id: uuidv4(),
        name: faker.company.name() + " School",
        address: faker.location.streetAddress(),
        phone_number: faker.phone.number(),
        school_code: faker.string.alphanumeric(6).toUpperCase(),
        is_active: true,
        school_image: faker.image.urlLoremFlickr({ category: "school", width: 640, height: 480 }),
        motto: faker.company.catchPhrase(),
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
    await queryInterface.bulkInsert("schools", schools);

    // --- Step 2: Create School Sequences
    const sequences = schools.map((s) => ({
      school_id: s.school_id,
      year: currentYear,
      last_sequence: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }));
    await queryInterface.bulkInsert("school_sequences", sequences);

    // --- Step 3: Create Sessions + Terms for each school
    const sessions = [];
    const terms = [];
    const today = new Date();
    const twoMonthsLater = new Date(today);
    twoMonthsLater.setMonth(today.getMonth() + 2);

    for (const school of schools) {
      const sessionId = uuidv4();
      sessions.push({
        session_id: sessionId,
        school_id: school.school_id,
        name: `${currentYear}/${currentYear + 1} Academic Session`,
        is_active: true,
        start_date: today,
        end_date: twoMonthsLater,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const termId = uuidv4();
      terms.push({
        term_id: termId,
        school_id: school.school_id,
        session_id: sessionId,
        name: "First Term",
        start_date: today,
        end_date: twoMonthsLater,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Attach for later use
      school.session_id = sessionId;
      school.term_id = termId;
    }

    await queryInterface.bulkInsert("sessions", sessions);
    await queryInterface.bulkInsert("terms", terms);

    // --- Step 4: Create Classes for each school
    const classes = [];
    const defaultClasses = [
      { name: "Junior Secondary School 1", short: "JSS1", grade_level: "JSS1" },
      { name: "Junior Secondary School 2", short: "JSS2", grade_level: "JSS2" },
      { name: "Junior Secondary School 3", short: "JSS3", grade_level: "JSS3" },
    ];

    for (const school of schools) {
      for (const cls of defaultClasses) {
        classes.push({
          class_id: uuidv4(),
          school_id: school.school_id,
          name: cls.name,
          short: cls.short,
          grade_level: cls.grade_level,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("classes", classes);

    // group classes by school for later assignment
    const schoolClassesMap = {};
    for (const cls of classes) {
      if (!schoolClassesMap[cls.school_id]) schoolClassesMap[cls.school_id] = [];
      schoolClassesMap[cls.school_id].push(cls);
    }

    // --- Step 5: Users (Admin, Teachers, Students + ClassStudent links)
    const users = [];
    const userRoles = [];
    const classStudents = [];

    for (const school of schools) {
      // Admin
      const adminId = uuidv4();
      users.push({
        user_id: adminId,
        school_id: school.school_id,
        username: faker.internet.username(),
        password_hash: bcrypt.hashSync("password123", 10),
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        gender: faker.helpers.arrayElement(["Male", "Female"]),
        role_id: roleMap["Admin"],
        is_approved: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      userRoles.push({
        id: uuidv4(),
        user_id: adminId,
        role_id: roleMap["Admin"],
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Teachers
      for (let i = 0; i < 5; i++) {
        const teacherId = uuidv4();
        users.push({
          user_id: teacherId,
          school_id: school.school_id,
          username: faker.internet.username(),
          password_hash: bcrypt.hashSync("password123", 10),
          email: faker.internet.email(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          gender: faker.helpers.arrayElement(["Male", "Female"]),
          role_id: roleMap["Teacher"],
          is_approved: true,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
        userRoles.push({
          id: uuidv4(),
          user_id: teacherId,
          role_id: roleMap["Teacher"],
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // Students + ClassStudents
      let seqCounter = 0;
      for (let i = 0; i < 20; i++) {
        seqCounter++;
        const admission_number = `${school.school_code}-${currentYear}-${String(
          seqCounter
        ).padStart(4, "0")}`;

        const studentId = uuidv4();
        users.push({
          user_id: studentId,
          school_id: school.school_id,
          username: faker.internet.username(),
          password_hash: bcrypt.hashSync("password123", 10),
          email: faker.internet.email(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          gender: faker.helpers.arrayElement(["Male", "Female"]),
          admission_number,
          role_id: roleMap["Student"],
          is_approved: true,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
        userRoles.push({
          id: uuidv4(),
          user_id: studentId,
          role_id: roleMap["Student"],
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Randomly assign student to one of the school's classes
        const randomClass =
          faker.helpers.arrayElement(schoolClassesMap[school.school_id]);

        classStudents.push({
          class_id: randomClass.class_id,
          student_id: studentId,
          session_id: school.session_id,
          term_id: school.term_id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("users", users);
    await queryInterface.bulkInsert("user_roles", userRoles);
    await queryInterface.bulkInsert("class_students", classStudents);

    console.log("✅ Database seeded with schools, sessions, terms, classes, users, and class_students!");
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("class_students", null, {});
    await queryInterface.bulkDelete("user_roles", null, {});
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("classes", null, {});
    await queryInterface.bulkDelete("terms", null, {});
    await queryInterface.bulkDelete("sessions", null, {});
    await queryInterface.bulkDelete("school_sequences", null, {});
    await queryInterface.bulkDelete("schools", null, {});
    console.log("🗑️ Seed data reverted.");
  },
};

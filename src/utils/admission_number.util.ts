import School from "../models/school.model";
import SchoolSequence from "../models/school_sequence.model";
import { AppError } from "./error.util";

/**
 * Generates a unique admission number for a student in a given school.
 * Format: SCHOOLCODE-YEAR-0001
 *
 * @param school_id - UUID of the school
 * @param transaction - Sequelize transaction
 * @returns admission number string
 */
export async function generateAdmissionNumber(
  school_id: string,
  transaction: any
): Promise<string> {
  // 1️⃣ Load the school to get its code
  const school = await School.findByPk(school_id, { transaction });
  if (!school) {
    throw new AppError("School not found", 404);
  }

  if (!school.school_code) {
    throw new AppError(
      "School code not defined. Cannot create admission number",
      500
    );
  }

  // 2️⃣ Get current year
  const currentYear = new Date().getFullYear();

  // 3️⃣ Find or create sequence record for school + year
  const [sequence] = await SchoolSequence.findOrCreate({
    where: { school_id, year: currentYear },
    defaults: { last_sequence: 0 },
    transaction,
  });

  // 4️⃣ Increment and update
  const nextSeq = sequence.last_sequence + 1;
  await sequence.update({ last_sequence: nextSeq }, { transaction });

  // 5️⃣ Build formatted number
  const admissionNumber = `${school.school_code}-${currentYear}-${String(
    nextSeq
  ).padStart(4, "0")}`;

  return admissionNumber;
}

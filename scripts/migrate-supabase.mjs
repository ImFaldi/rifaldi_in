import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnvPkg from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnvPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const seedDir = path.join(rootDir, "supabase", "seeds");

loadEnvConfig(rootDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Env Supabase belum lengkap. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function readSeedFile(fileName) {
  const filePath = path.join(seedDir, fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function ensureTableExists(tableName) {
  const { error } = await supabase.from(tableName).select("id").limit(1);
  if (error) {
    throw new Error(
      `Tabel ${tableName} belum siap. Jalankan SQL di supabase/schema.sql terlebih dahulu. Detail: ${error.message}`
    );
  }
}

async function migrateExperiences() {
  const experiences = await readSeedFile("experiences.json");

  let inserted = 0;
  let updated = 0;

  for (const exp of experiences) {
    const { data: existing, error: findError } = await supabase
      .from("experiences")
      .select("id")
      .eq("role", exp.role)
      .eq("company", exp.company)
      .eq("period", exp.period)
      .maybeSingle();

    if (findError) {
      throw new Error(`Gagal cek experience ${exp.role}: ${findError.message}`);
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("experiences")
        .update({
          location: exp.location,
          type: exp.type,
          description: exp.description,
          description_en: exp.description_en ?? null,
          tags: exp.tags,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(`Gagal update experience ${exp.role}: ${updateError.message}`);
      }

      updated += 1;
      continue;
    }

    const { error: insertError } = await supabase.from("experiences").insert({
      role: exp.role,
      company: exp.company,
      location: exp.location,
      period: exp.period,
      type: exp.type,
      description: exp.description,
      description_en: exp.description_en ?? null,
      tags: exp.tags,
    });

    if (insertError) {
      throw new Error(`Gagal insert experience ${exp.role}: ${insertError.message}`);
    }

    inserted += 1;
  }

  return { inserted, updated, total: experiences.length };
}

async function migrateCertifications() {
  const certifications = await readSeedFile("certifications.json");

  const { data, error } = await supabase
    .from("certifications")
    .upsert(certifications, { onConflict: "credential_id" })
    .select("id");

  if (error) {
    throw new Error(`Gagal migrasi certifications: ${error.message}`);
  }

  return { upserted: data?.length ?? certifications.length, total: certifications.length };
}

async function migrateProjects() {
  const projects = await readSeedFile("projects.json");
  let inserted = 0;
  let updated = 0;

  for (const project of projects) {
    const { data: existing, error: findError } = await supabase
      .from("projects")
      .select("id")
      .eq("title", project.title)
      .maybeSingle();

    if (findError) {
      throw new Error(`Gagal cek project ${project.title}: ${findError.message}`);
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          title_en: project.title_en,
          description: project.description,
          description_en: project.description_en,
          tags: project.tags,
          href: project.href,
          repo: project.repo,
          gradient: project.gradient,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(`Gagal update project ${project.title}: ${updateError.message}`);
      }

      updated += 1;
      continue;
    }

    const { error: insertError } = await supabase.from("projects").insert(project);

    if (insertError) {
      throw new Error(`Gagal insert project ${project.title}: ${insertError.message}`);
    }

    inserted += 1;
  }

  return { inserted, updated, total: projects.length };
}

async function main() {
  console.log("[1/4] Cek tabel Supabase...");
  await ensureTableExists("experiences");
  await ensureTableExists("certifications");
  await ensureTableExists("projects");

  console.log("[2/4] Migrasi experiences...");
  const expResult = await migrateExperiences();

  console.log("[3/4] Migrasi certifications...");
  const certResult = await migrateCertifications();

  console.log("[4/4] Migrasi projects...");
  const projectResult = await migrateProjects();

  console.log("\nMigrasi selesai.");
  console.log(`Experiences: total ${expResult.total}, inserted ${expResult.inserted}, updated ${expResult.updated}`);
  console.log(`Certifications: total ${certResult.total}, upserted ${certResult.upserted}`);
  console.log(`Projects: total ${projectResult.total}, inserted ${projectResult.inserted}, updated ${projectResult.updated}`);
}

main().catch((error) => {
  console.error("Migrasi gagal:", error.message);
  process.exit(1);
});

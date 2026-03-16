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

async function migrateEducations() {
  const educations = await readSeedFile("educations.json");
  let inserted = 0;
  let updated = 0;

  for (const education of educations) {
    const { data: existing, error: findError } = await supabase
      .from("educations")
      .select("id")
      .eq("degree", education.degree)
      .eq("institution", education.institution)
      .eq("period", education.period)
      .maybeSingle();

    if (findError) {
      throw new Error(`Gagal cek education ${education.degree}: ${findError.message}`);
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("educations")
        .update({
          location: education.location,
          description: education.description,
          description_en: education.description_en ?? null,
          status: education.status ?? "published",
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(`Gagal update education ${education.degree}: ${updateError.message}`);
      }

      updated += 1;
      continue;
    }

    const { error: insertError } = await supabase.from("educations").insert({
      degree: education.degree,
      institution: education.institution,
      location: education.location,
      period: education.period,
      description: education.description,
      description_en: education.description_en ?? null,
      status: education.status ?? "published",
    });

    if (insertError) {
      throw new Error(`Gagal insert education ${education.degree}: ${insertError.message}`);
    }

    inserted += 1;
  }

  return { inserted, updated, total: educations.length };
}

async function migrateBlogs() {
  const blogs = await readSeedFile("blogs.json");
  let inserted = 0;
  let updated = 0;

  for (const blog of blogs) {
    const { data: existing, error: findError } = await supabase
      .from("blogs")
      .select("id")
      .eq("slug", blog.slug)
      .maybeSingle();

    if (findError) {
      throw new Error(`Gagal cek blog ${blog.slug}: ${findError.message}`);
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("blogs")
        .update({
          title: blog.title,
          title_en: blog.title_en ?? null,
          excerpt: blog.excerpt,
          excerpt_en: blog.excerpt_en ?? null,
          content: blog.content,
          content_en: blog.content_en ?? null,
          cover_image: blog.cover_image ?? null,
          read_time: blog.read_time ?? "5 min read",
          published_at: blog.published_at,
          status: blog.status ?? "published",
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(`Gagal update blog ${blog.slug}: ${updateError.message}`);
      }

      updated += 1;
      continue;
    }

    const { error: insertError } = await supabase.from("blogs").insert({
      title: blog.title,
      title_en: blog.title_en ?? null,
      slug: blog.slug,
      excerpt: blog.excerpt,
      excerpt_en: blog.excerpt_en ?? null,
      content: blog.content,
      content_en: blog.content_en ?? null,
      cover_image: blog.cover_image ?? null,
      read_time: blog.read_time ?? "5 min read",
      published_at: blog.published_at,
      status: blog.status ?? "published",
    });

    if (insertError) {
      throw new Error(`Gagal insert blog ${blog.slug}: ${insertError.message}`);
    }

    inserted += 1;
  }

  return { inserted, updated, total: blogs.length };
}

async function main() {
  console.log("[1/6] Cek tabel Supabase...");
  await ensureTableExists("experiences");
  await ensureTableExists("certifications");
  await ensureTableExists("projects");
  await ensureTableExists("educations");
  await ensureTableExists("blogs");

  console.log("[2/6] Migrasi experiences...");
  const expResult = await migrateExperiences();

  console.log("[3/6] Migrasi certifications...");
  const certResult = await migrateCertifications();

  console.log("[4/6] Migrasi projects...");
  const projectResult = await migrateProjects();

  console.log("[5/6] Migrasi educations...");
  const educationResult = await migrateEducations();

  console.log("[6/6] Migrasi blogs...");
  const blogResult = await migrateBlogs();

  console.log("\nMigrasi selesai.");
  console.log(`Experiences: total ${expResult.total}, inserted ${expResult.inserted}, updated ${expResult.updated}`);
  console.log(`Certifications: total ${certResult.total}, upserted ${certResult.upserted}`);
  console.log(`Projects: total ${projectResult.total}, inserted ${projectResult.inserted}, updated ${projectResult.updated}`);
  console.log(`Educations: total ${educationResult.total}, inserted ${educationResult.inserted}, updated ${educationResult.updated}`);
  console.log(`Blogs: total ${blogResult.total}, inserted ${blogResult.inserted}, updated ${blogResult.updated}`);
}

main().catch((error) => {
  console.error("Migrasi gagal:", error.message);
  process.exit(1);
});

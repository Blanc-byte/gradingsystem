-- Enable Row Level Security on all tables
ALTER TABLE "Teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Section" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Grade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subjects" ENABLE ROW LEVEL SECURITY;

-- Teachers table policies
-- Allow anyone to select and insert teachers (for registration)
CREATE POLICY "Allow public select on Teachers" ON "Teachers"
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on Teachers" ON "Teachers"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on Teachers" ON "Teachers"
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on Teachers" ON "Teachers"
    FOR DELETE USING (true);

-- Section table policies
-- Allow anyone to select and insert sections
CREATE POLICY "Allow public select on Section" ON "Section"
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on Section" ON "Section"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on Section" ON "Section"
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on Section" ON "Section"
    FOR DELETE USING (true);

-- Students table policies
-- Allow anyone to select and insert students
CREATE POLICY "Allow public select on Students" ON "Students"
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on Students" ON "Students"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on Students" ON "Students"
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on Students" ON "Students"
    FOR DELETE USING (true);

-- Grade table policies
-- Allow anyone to select and insert grades
CREATE POLICY "Allow public select on Grade" ON "Grade"
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on Grade" ON "Grade"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on Grade" ON "Grade"
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on Grade" ON "Grade"
    FOR DELETE USING (true);

-- Subjects table policies
-- Allow anyone to select and insert subjects
CREATE POLICY "Allow public select on Subjects" ON "Subjects"
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on Subjects" ON "Subjects"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on Subjects" ON "Subjects"
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on Subjects" ON "Subjects"
    FOR DELETE USING (true);

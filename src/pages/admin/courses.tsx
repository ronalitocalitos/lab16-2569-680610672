import { useState } from "react";
import { PlusCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeInstructor } = useEnrollmentStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [instructors, setInstructors] = useState<string[]>([]);
  const [instructorInput, setInstructorInput] = useState("");
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const existingCourseCodes = courses.map((c) => c.courseCode.toLowerCase());
  const isDuplicate = courseCode.trim() !== "" && existingCourseCodes.includes(courseCode.trim().toLowerCase());

  const allInstructors = Array.from(new Set(courses.flatMap((c) => c.instructors || [])));
  const filteredInstructors = allInstructors.filter(
    (i) => !instructors.includes(i) && i.toLowerCase().includes(instructorInput.toLowerCase())
  );

  const handleAddInstructor = (name: string) => {
    if (!name.trim() || instructors.includes(name.trim())) return;
    setInstructors([...instructors, name.trim()]);
    setInstructorInput("");
    setIsDropdownOpen(false);
  };

  const handleRemoveNewInstructor = (name: string) => {
    setInstructors(instructors.filter((i) => i !== name));
  };

  const handleSave = () => {
    if (isDuplicate || !courseCode.trim() || !courseTitle.trim()) return;
    addCourse({
      courseCode: courseCode.trim().toUpperCase(),
      courseTitle: courseTitle.trim(),
      instructors,
    });
    setDialogOpen(false);
    setCourseCode("");
    setCourseTitle("");
    setInstructors([]);
    setInstructorInput("");
  };

  const resetForm = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setCourseCode("");
      setCourseTitle("");
      setInstructors([]);
      setInstructorInput("");
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
      </div>

      <Dialog open={dialogOpen} onOpenChange={resetForm}>
        <DialogTrigger >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มวิชา
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="courseCode">รหัสวิชา</Label>
              <Input
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className={isDuplicate ? "border-red-500 focus-visible:ring-red-500" : ""}
                aria-invalid={isDuplicate}
              />
              {isDuplicate && (
                <span className="text-sm text-red-500">
                  มีรหัสวิชา {courseCode.toUpperCase()} นี้แล้ว
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="courseTitle">ชื่อวิชา</Label>
              <Input
                id="courseTitle"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>ผู้สอน (พิมพ์แล้วกดเลือก หรือ Enter)</Label>
              <div className="relative">
                <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[40px] items-center focus-within:ring-2 focus-within:ring-ring">
                  {instructors.map((inst) => (
                    <Badge key={inst} variant="secondary">
                      {inst}
                      <button
                        type="button"
                        className="ml-1 cursor-pointer rounded-full outline-none hover:bg-destructive/20 hover:text-red-500 p-0.5"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveNewInstructor(inst);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    type="text"
                    className="flex-1 outline-none bg-transparent min-w-[120px] text-sm"
                    placeholder="เพิ่มผู้สอน..."
                    value={instructorInput}
                    onChange={(e) => setInstructorInput(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddInstructor(instructorInput);
                      }
                    }}
                  />
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 top-full left-0 mt-1 w-full bg-popover text-popover-foreground border rounded-md shadow-md max-h-48 overflow-y-auto">
                    {filteredInstructors.length > 0 ? (
                      filteredInstructors.map((inst) => (
                        <div
                          key={inst}
                          className="p-2 hover:bg-muted cursor-pointer text-sm"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddInstructor(inst);
                          }}
                        >
                          {inst}
                        </div>
                      ))
                    ) : (
                      instructorInput.trim() === "" && (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          ยังไม่มีรายชื่อผู้สอนในระบบ
                        </div>
                      )
                    )}
                    
                    {instructorInput.trim() !== "" && (
                      <div
                        className="p-2 hover:bg-muted cursor-pointer text-sm font-medium text-primary"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleAddInstructor(instructorInput);
                        }}
                      >
                        + เพิ่มผู้สอน "{instructorInput}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isDuplicate || !courseCode.trim() || !courseTitle.trim()}
              onClick={handleSave}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.courseCode}>
                <TableCell className="font-medium">{c.courseCode}</TableCell>
                <TableCell>{c.courseTitle}</TableCell>
                <TableCell className="flex flex-wrap gap-2 py-3">
                  {!c.instructors || c.instructors.length === 0 ? (
                    <span className="text-sm text-muted-foreground">ยังไม่มีผู้สอน</span>
                  ) : (
                    c.instructors.map((inst) => (
                      <Badge key={inst} variant="outline" className="flex items-center gap-1">
                        {inst}
                        <button
                          type="button"
                          className="cursor-pointer rounded-full outline-none hover:bg-destructive/20 hover:text-red-500 p-0.5"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeInstructor(c.courseCode, inst);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger >
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบวิชา?</AlertDialogTitle>
                        <AlertDialogDescription>
                          คุณต้องการลบวิชา {c.courseCode} {c.courseTitle} ใช่หรือไม่?
                          การกระทำนี้ไม่สามารถกู้คืนได้ และจะลบข้อมูลการลงทะเบียนของนักศึกษาในวิชานี้ทั้งหมด
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeCourse(c.courseCode)} className="bg-red-500 hover:bg-red-600">
                          ลบวิชา
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  ยังไม่มีรายวิชาในระบบ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
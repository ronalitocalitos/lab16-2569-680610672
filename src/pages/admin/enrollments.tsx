import { useState } from "react";
import { PlusCircle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { cn } from "@/lib/utils";

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollStudents, unenrollStudent } = useEnrollmentStore();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState("all");
  const [openCombobox, setOpenCombobox] = useState(false);

  const handleCourseChange = (courseCode: string | null) => {
    if (!courseCode) return;
    setFormCourse(courseCode);
    setFormStudents([]);
  };

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    enrollStudents(formCourse, formStudents);
    setEnrollDialogOpen(false);
    setFormCourse(null);
    setFormStudents([]);
  };

  // นักศึกษาที่ยังไม่ได้ลงวิชานี้
  const availableStudents = students.filter(s => formCourse && !s.enrolledCourses.includes(formCourse));

  const rows = courses.filter((c) => filterCourse === "all" || c.courseCode === filterCourse);

  const handleStudentSelect = (studentId: string) => {
    setFormStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
      </div>

      <div className="flex gap-4 items-center">
        <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
          <DialogTrigger >
            <Button><PlusCircle className="mr-2 h-4 w-4" /> ลงทะเบียนให้นักศึกษา</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
              <DialogDescription>เลือกวิชาก่อน แล้วจึงเลือกนักศึกษา</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>วิชา</Label>
                <Select value={formCourse || ""} onValueChange={handleCourseChange}>
                  <SelectTrigger><SelectValue placeholder="เลือกวิชา" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => <SelectItem key={c.courseCode} value={c.courseCode}>{c.courseCode} - {c.courseTitle}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-1.5">
                <Label>นักศึกษา</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger >
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      disabled={!formCourse || availableStudents.length === 0}
                      className="w-full justify-start h-auto min-h-[40px] px-2 py-1 flex-wrap"
                    >
                      {formStudents.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formStudents.map((id) => {
                            const student = availableStudents.find(s => s.studentId === id);
                            return student ? (
                              <Badge key={id} variant="secondary" className="mr-1 mb-1 flex items-center gap-1">
                                {student.firstName} {student.lastName}
                                <div
                                  role="button"
                                  className="cursor-pointer rounded-full hover:bg-destructive/20 hover:text-red-500"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleStudentSelect(id);
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </div>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground ml-2">
                           {formCourse ? "พิมพ์เพื่อค้นหา เลือกได้หลายคน..." : "กรุณาเลือกวิชาก่อน"}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ค้นหานักศึกษา..." />
                      <CommandList>
                        <CommandEmpty>ไม่พบรายชื่อนักศึกษา</CommandEmpty>
                        <CommandGroup>
                          {availableStudents.map((s) => (
                            <CommandItem
                              key={s.studentId}
                              value={`${s.studentId} ${s.firstName} ${s.lastName}`}
                              onSelect={() => handleStudentSelect(s.studentId)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formStudents.includes(s.studentId) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {s.studentId} — {s.firstName} {s.lastName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

            </div>
            <DialogFooter>
              <Button disabled={!formCourse || formStudents.length === 0} onClick={handleEnroll}>
                <PlusCircle className="mr-2 h-4 w-4" /> ลงทะเบียน ({formStudents.length} คน)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Select value={filterCourse} onValueChange={(value) => setFilterCourse(value as string)}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="ค้นหาตามวิชา" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกวิชา</SelectItem>
            {courses.map(c => <SelectItem key={c.courseCode} value={c.courseCode}>{c.courseCode}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead className="w-[100px]">จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => {
              const enrolled = students.filter(s => s.enrolledCourses.includes(c.courseCode));
              return (
                <TableRow key={c.courseCode}>
                  <TableCell className="font-medium">{c.courseCode}</TableCell>
                  <TableCell>{c.courseTitle}</TableCell>
                  <TableCell>{enrolled.length}</TableCell>
                  <TableCell className="flex flex-wrap gap-2 py-3">
                    {enrolled.length === 0 ? (
                      <span className="text-sm text-muted-foreground">ยังไม่มีการลงทะเบียน</span>
                    ) : (
                      enrolled.map(s => (
                        <Badge key={s.studentId} variant="secondary" className="flex items-center gap-1">
                          {s.firstName} {s.lastName}
                          <button
                            type="button"
                            className="cursor-pointer rounded-full outline-none hover:bg-destructive/20 hover:text-red-500 p-0.5"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              unenrollStudent(c.courseCode, s.studentId);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}